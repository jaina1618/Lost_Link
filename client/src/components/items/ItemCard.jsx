import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Zap } from 'lucide-react';
import { formatDate, getStatusBadgeClass, SERVER_URL } from '../../utils';

export default function ItemCard({ item, type }) {
  const date = type === 'lost' ? item.dateLost : item.dateFound;
  const dateLabel = type === 'lost' ? 'Lost' : 'Found';
  const imageUrl = item.image ? (item.image.startsWith('/uploads') ? `${SERVER_URL}${item.image}` : item.image) : null;

  return (
    <Link to={`/items/${type}/${item._id}`}
      className="card hover:border-primary-500/40 transition-all duration-200 hover:scale-[1.01] group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="aspect-[4/3] bg-surface-elevated overflow-hidden flex-shrink-0 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {type === 'lost' ? '🔍' : '📦'}
            </div>
          </div>
        )}
        {/* Type badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold ${type === 'lost' ? 'bg-rose-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
          {type === 'lost' ? '🔍 LOST' : '📦 FOUND'}
        </div>
        {item.matchCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
            <Zap size={10} /> {item.matchCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-white text-sm group-hover:text-primary-300 transition-colors line-clamp-1">
            {item.itemName}
          </h3>
          <p className="text-xs text-surface-muted mt-1 line-clamp-2">{item.description}</p>
        </div>

        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center gap-2 text-xs text-surface-muted">
            <Tag size={12} className="text-primary-400 flex-shrink-0" />
            <span>{item.category}{item.brand ? ` · ${item.brand}` : ''}{item.color ? ` · ${item.color}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-muted">
            <MapPin size={12} className="text-rose-400 flex-shrink-0" />
            <span className="truncate">{item.location?.city || item.location?.address}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-muted">
            <Calendar size={12} className="text-emerald-400 flex-shrink-0" />
            <span>{dateLabel} on {formatDate(date)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
          <span className="text-xs text-primary-400 group-hover:text-primary-300 font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
}
