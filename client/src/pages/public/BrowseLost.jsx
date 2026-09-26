import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { lostApi } from '../../api';
import ItemCard from '../../components/items/ItemCard';
import { CATEGORIES, COLORS } from '../../utils';

const DEBOUNCE_MS = 500;

export default function BrowseLost() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState({ page: 1, limit: 12 });
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await lostApi.getAll({ ...p, keyword: p.keyword || undefined });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(params); }, [params]);

  useEffect(() => {
    const t = setTimeout(() => setParams(p => ({ ...p, page: 1, keyword: search || undefined })), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const setFilter = (key, val) => setParams(p => ({ ...p, page: 1, [key]: val || undefined }));
  const clearAll = () => { setParams({ page: 1, limit: 12 }); setSearch(''); };

  const SkeletonCard = () => (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Browse Lost Items</h1>
        <p className="text-surface-muted mt-1">Help someone find their lost belongings</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input
            className="input pl-10"
            placeholder="Search by name, brand, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'border-primary-500 text-primary-400' : ''}`}>
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-slide-up">
          <select className="input text-sm" onChange={e => setFilter('category', e.target.value)} value={params.category || ''}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input text-sm" onChange={e => setFilter('color', e.target.value)} value={params.color || ''}>
            <option value="">All Colors</option>
            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="input text-sm" placeholder="City..." value={params.city || ''} onChange={e => setFilter('city', e.target.value)} />
          <input className="input text-sm" placeholder="Brand..." value={params.brand || ''} onChange={e => setFilter('brand', e.target.value)} />
          <button onClick={clearAll} className="btn-ghost text-sm flex items-center gap-1">
            <X size={14} /> Clear All
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-surface-muted mb-4">
        {!loading && `${pagination.total || 0} items found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Lost Items Found</h3>
          <p className="text-surface-muted text-sm">Try adjusting your filters or search query</p>
          <button onClick={clearAll} className="btn-primary mt-4">Clear Filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => <ItemCard key={item._id} item={item} type="lost" />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setParams(prev => ({ ...prev, page: p }))}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === params.page ? 'bg-primary-600 text-white' : 'bg-surface-elevated text-gray-400 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
