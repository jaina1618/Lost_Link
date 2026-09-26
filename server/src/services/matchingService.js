const Match = require('../models/Match');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const { triggerNotification } = require('./notificationService');

const THRESHOLD = parseInt(process.env.MATCH_THRESHOLD || '40');

// ─── Utilities ────────────────────────────────────────────────────────────────
function tokenize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

const STOPWORDS = new Set([
  'the','a','an','is','in','on','at','to','of','and','or','it','was',
  'i','my','near','found','lost','around','this','that','with','for',
  'from','by','some','have','been','were','they','there','has','had',
]);

// ─── Scoring Functions ─────────────────────────────────────────────────────────
function scoreCategory(lost, found) {
  if (!lost.category || !found.category) return 0;
  if (lost.category !== found.category) return 0;
  const subMatch =
    lost.subcategory && found.subcategory &&
    lost.subcategory.toLowerCase().trim() === found.subcategory.toLowerCase().trim();
  return subMatch ? 25 : 20;
}

function scoreLocation(lost, found) {
  const lCity = (lost.location?.city || '').toLowerCase().trim();
  const fCity = (found.location?.city || '').toLowerCase().trim();
  if (!lCity || !fCity || lCity !== fCity) return 0;

  let score = 15;
  const lWords = new Set(tokenize(lost.location?.address || ''));
  const fWords = new Set(tokenize(found.location?.address || ''));
  const overlap = [...lWords].filter(w => fWords.has(w)).length;
  score += Math.min(overlap, 5);
  return Math.min(score, 20);
}

function scoreDate(lost, found) {
  if (!lost.dateLost || !found.dateFound) return 0;
  const diffDays = Math.abs(
    (new Date(lost.dateLost) - new Date(found.dateFound)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return 15;
  if (diffDays <= 3) return 12;
  if (diffDays <= 7) return 8;
  if (diffDays <= 14) return 4;
  if (diffDays <= 30) return 2;
  return 0;
}

function scoreColor(lost, found) {
  if (!lost.color || !found.color) return 0;
  const lc = lost.color.toLowerCase().trim();
  const fc = found.color.toLowerCase().trim();
  if (lc === fc) return 15;
  if (lc.includes(fc) || fc.includes(lc)) return 8;
  return 0;
}

function scoreBrand(lost, found) {
  if (!lost.brand || !found.brand) return 0;
  const lb = lost.brand.toLowerCase().trim();
  const fb = found.brand.toLowerCase().trim();
  if (lb === fb) return 10;
  if (lb.includes(fb) || fb.includes(lb)) return 5;
  return 0;
}

function scoreDescription(lost, found) {
  const lTokens = new Set(tokenize(lost.description).filter(w => !STOPWORDS.has(w)));
  const fTokens = new Set(tokenize(found.description).filter(w => !STOPWORDS.has(w)));
  if (lTokens.size === 0 || fTokens.size === 0) return 0;
  const intersect = [...lTokens].filter(w => fTokens.has(w)).length;
  const union = new Set([...lTokens, ...fTokens]).size;
  const jaccard = intersect / union;
  return Math.round(jaccard * 15);
}

function calculateMatchScore(lostItem, foundItem) {
  const breakdown = {
    category: scoreCategory(lostItem, foundItem),
    location: scoreLocation(lostItem, foundItem),
    date: scoreDate(lostItem, foundItem),
    color: scoreColor(lostItem, foundItem),
    brand: scoreBrand(lostItem, foundItem),
    description: scoreDescription(lostItem, foundItem),
  };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score: Math.min(total, 100), breakdown };
}

// ─── Engine ────────────────────────────────────────────────────────────────────
async function runMatchForLostItem(lostItem) {
  try {
    const foundItems = await FoundItem.find({
      status: { $in: ['Available', 'Potential Match'] },
      isActive: true,
    }).lean();

    for (const foundItem of foundItems) {
      const { score, breakdown } = calculateMatchScore(lostItem, foundItem);
      if (score < THRESHOLD) continue;

      await Match.findOneAndUpdate(
        { lostItem: lostItem._id, foundItem: foundItem._id },
        {
          lostItem: lostItem._id,
          foundItem: foundItem._id,
          lostItemOwner: lostItem.reportedBy,
          foundItemReporter: foundItem.reportedBy,
          matchScore: score,
          scoreBreakdown: breakdown,
        },
        { upsert: true, new: true }
      );

      if (score >= 70) {
        await LostItem.findByIdAndUpdate(lostItem._id, { status: 'Potential Match' });
        await FoundItem.findByIdAndUpdate(foundItem._id, { status: 'Potential Match' });
      }

      await triggerNotification(
        lostItem.reportedBy,
        'MATCH_FOUND',
        `Potential Match Found (${score}%)`,
        `A found item may match your lost "${lostItem.itemName}".`,
        `/dashboard/matches`
      );
      await triggerNotification(
        foundItem.reportedBy,
        'MATCH_FOUND',
        `Your found item has a potential owner (${score}%)`,
        `Someone's lost "${lostItem.itemName}" may be what you found.`,
        `/dashboard/matches`
      );

      await LostItem.findByIdAndUpdate(lostItem._id, { $inc: { matchCount: 1 } });
      await FoundItem.findByIdAndUpdate(foundItem._id, { $inc: { matchCount: 1 } });
    }
  } catch (err) {
    console.error('Matching Engine Error (Lost):', err.message);
  }
}

async function runMatchForFoundItem(foundItem) {
  try {
    const lostItems = await LostItem.find({
      status: { $in: ['Active', 'Potential Match'] },
      isActive: true,
    }).lean();

    for (const lostItem of lostItems) {
      const { score, breakdown } = calculateMatchScore(lostItem, foundItem);
      if (score < THRESHOLD) continue;

      await Match.findOneAndUpdate(
        { lostItem: lostItem._id, foundItem: foundItem._id },
        {
          lostItem: lostItem._id,
          foundItem: foundItem._id,
          lostItemOwner: lostItem.reportedBy,
          foundItemReporter: foundItem.reportedBy,
          matchScore: score,
          scoreBreakdown: breakdown,
        },
        { upsert: true, new: true }
      );

      if (score >= 70) {
        await LostItem.findByIdAndUpdate(lostItem._id, { status: 'Potential Match' });
        await FoundItem.findByIdAndUpdate(foundItem._id, { status: 'Potential Match' });
      }

      await triggerNotification(
        lostItem.reportedBy,
        'MATCH_FOUND',
        `Potential Match Found (${score}%)`,
        `A found item may match your lost "${lostItem.itemName}".`,
        `/dashboard/matches`
      );
      await triggerNotification(
        foundItem.reportedBy,
        'MATCH_FOUND',
        `Your found item has a potential owner (${score}%)`,
        `Someone's lost "${lostItem.itemName}" may be what you found.`,
        `/dashboard/matches`
      );

      await LostItem.findByIdAndUpdate(lostItem._id, { $inc: { matchCount: 1 } });
      await FoundItem.findByIdAndUpdate(foundItem._id, { $inc: { matchCount: 1 } });
    }
  } catch (err) {
    console.error('Matching Engine Error (Found):', err.message);
  }
}

module.exports = { calculateMatchScore, runMatchForLostItem, runMatchForFoundItem };
