import { Link } from 'react-router-dom';
import { Search, MapPin, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { lostApi, foundApi } from '../../api';
import ItemCard from '../../components/items/ItemCard';

const STATS = [
  { value: '5,000+', label: 'Items Reported' },
  { value: '2,100+', label: 'Items Recovered' },
  { value: '92%', label: 'Match Accuracy' },
  { value: '10,000+', label: 'Happy Users' },
];

const FEATURES = [
  { icon: '🎯', title: 'Intelligent Matching', desc: 'Our smart engine scores each potential match based on category, location, date, color, brand, and description keywords.' },
  { icon: '🔐', title: 'Secure Verification', desc: 'Private ownership fields ensure only the real owner can claim their lost item — preventing fraud.' },
  { icon: '💬', title: 'Safe Communication', desc: 'Once verified, communicate directly with the finder to coordinate pickup safely.' },
  { icon: '📊', title: 'Live Status Tracking', desc: "Track your item's journey from Active → Potential Match → Verified → Recovered in real time." },
  { icon: '🗺️', title: 'Location Aware', desc: 'Reports are tied to specific locations, boosting match confidence when items are found nearby.' },
  { icon: '⚡', title: 'Instant Notifications', desc: 'Get notified the moment a potential match is found, a request is accepted, or you receive a message.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Report Your Item', desc: 'Create a detailed report with photos, description, and location.' },
  { step: '02', title: 'Smart Matching Runs', desc: 'Our engine compares your report with all existing found items instantly.' },
  { step: '03', title: 'Review Potential Matches', desc: 'See a ranked list of possible matches with confidence scores.' },
  { step: '04', title: 'Verify & Recover', desc: 'Prove ownership through private details, connect with the finder, and get your item back.' },
];

export default function LandingPage() {
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);

  useEffect(() => {
    lostApi.getAll({ limit: 3 }).then(r => setRecentLost(r.data.data)).catch(() => {});
    foundApi.getAll({ limit: 3 }).then(r => setRecentFound(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-60 left-1/2 -translate-x-1/2 w-[600px] h-60 bg-primary-600/10 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
              <Zap size={14} /> Intelligent Lost-and-Found Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
              Reconnect with
              <span className="block bg-gradient-to-r from-primary-400 via-violet-400 to-accent bg-clip-text text-transparent">
                What Matters Most
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              LostLink uses an intelligent matching engine to connect people who've lost belongings with people who've found them — with verified ownership and secure communication.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register" className="btn-primary btn-lg group">
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/items/lost" className="btn-secondary btn-lg">
                <Search size={18} /> Browse Lost Items
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center mt-10 text-sm text-surface-muted">
              {['Free to use', 'No credit card', 'Privacy protected', 'Fraud prevention'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-accent" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-border py-12 bg-surface-card/50">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-primary-400 to-accent bg-clip-text text-transparent">{value}</div>
                <div className="text-sm text-surface-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">How LostLink Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Four simple steps from report to recovery</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative card p-6 hover:border-primary-500/40 transition-all group">
                <div className="text-5xl font-black text-primary-600/30 mb-4 group-hover:text-primary-600/50 transition-colors">{step}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-surface-muted leading-relaxed">{desc}</p>
                {i < 3 && <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-surface-muted z-10"><ArrowRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-card/30">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Built for the real-world problem of lost belongings</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card p-6 hover:border-primary-500/40 transition-all hover:scale-[1.01] group">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-surface-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Items */}
      {(recentLost.length > 0 || recentFound.length > 0) && (
        <section className="py-20">
          <div className="page-container">
            {recentLost.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Recently Lost</h2>
                    <p className="text-surface-muted text-sm">Help someone find their belongings</p>
                  </div>
                  <Link to="/items/lost" className="btn-ghost btn-sm">View all →</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentLost.map(item => <ItemCard key={item._id} item={item} type="lost" />)}
                </div>
              </div>
            )}
            {recentFound.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Recently Found</h2>
                    <p className="text-surface-muted text-sm">Is one of these yours?</p>
                  </div>
                  <Link to="/items/found" className="btn-ghost btn-sm">View all →</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentFound.map(item => <ItemCard key={item._id} item={item} type="found" />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20">
        <div className="page-container">
          <div className="gradient-border rounded-2xl p-1">
            <div className="bg-surface-card rounded-2xl p-10 lg:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-radial from-primary-600/10 via-transparent to-transparent pointer-events-none" />
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 relative">
                Ready to Find Your Lost Item?
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 relative">
                Join thousands who've already reunited with their belongings using LostLink's intelligent matching platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <Link to="/auth/register" className="btn-primary btn-lg">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/items/lost" className="btn-secondary btn-lg">
                  <Search size={18} /> Search Lost Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
