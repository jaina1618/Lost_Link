import { getScoreColor, getScoreLabel } from '../../utils';

export default function MatchScoreBar({ score, breakdown }) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  const scoreItems = [
    { key: 'category', label: 'Category', max: 25 },
    { key: 'location', label: 'Location', max: 20 },
    { key: 'date', label: 'Date', max: 15 },
    { key: 'color', label: 'Color', max: 15 },
    { key: 'brand', label: 'Brand', max: 10 },
    { key: 'description', label: 'Keywords', max: 15 },
  ];

  return (
    <div className="space-y-4">
      {/* Total score */}
      <div className="text-center">
        <div className={`text-4xl font-black ${label.color}`}>{score}%</div>
        <div className={`text-sm font-semibold mt-1 ${label.color}`}>{label.text}</div>
        <div className="mt-3 h-3 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <p className="text-xs text-surface-muted font-semibold uppercase tracking-wider">Score Breakdown</p>
          {scoreItems.map(({ key, label: lbl, max }) => {
            const val = breakdown[key] || 0;
            const pct = Math.round((val / max) * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-surface-muted w-16 flex-shrink-0">{lbl}</span>
                <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-primary-500' : 'bg-surface-border'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right">
                  {val > 0 ? <span className="text-emerald-400">+{val}</span> : <span className="text-surface-muted">0</span>}
                  <span className="text-surface-muted">/{max}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
