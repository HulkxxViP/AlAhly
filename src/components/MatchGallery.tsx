import { useState } from 'react';
import { Link } from 'react-router-dom';
import { matchGallery } from '../data/mockData';
import { MatchGalleryItem } from '../types';
import { ChevronLeft, ChevronRight, Camera, ExternalLink } from 'lucide-react';

const basePath = import.meta.env.BASE_URL;

export default function MatchGallery({ limit }: { limit?: number }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const items = limit ? matchGallery.slice(0, limit) : matchGallery;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-fade">
        {items.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} onSelect={() => setSelectedIndex(i)} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Camera className="w-10 h-10 text-ahly-muted/30 mx-auto mb-3" />
          <p className="text-sm text-ahly-muted">No match photos available yet</p>
          <p className="text-xs text-ahly-muted/50 mt-1">Check back after the next match</p>
        </div>
      )}

      {selectedIndex !== null && (
        <Lightbox
          items={items}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : items.length - 1))}
          onNext={() => setSelectedIndex((prev) => (prev! < items.length - 1 ? prev! + 1 : 0))}
        />
      )}
    </div>
  );
}

function GalleryCard({ item, index, onSelect }: { item: MatchGalleryItem; index: number; onSelect: () => void }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="glass-card-elevated overflow-hidden group text-left rounded-xl hover:border-ahly-red/40 transition-all duration-300 animate-scale-in cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[16/9] bg-ahly-dark/80 overflow-hidden">
        {failed ? (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-ahly-muted/30" />
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/80 border border-white/10">
          {item.matchTitle}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-ahly-text leading-relaxed line-clamp-2">{item.caption}</p>
        <p className="text-[10px] text-ahly-muted/50 mt-1.5">{item.date}</p>
      </div>
    </button>
  );
}

function Lightbox({ items, currentIndex, onClose, onPrev, onNext }: { items: MatchGalleryItem[]; currentIndex: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const item = items[currentIndex];
  const [failed, setFailed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-1 bg-ahly-dark/60 rounded-t-2xl overflow-hidden min-h-[50vh]">
          {failed ? (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-16 h-16 text-ahly-muted/30" />
            </div>
          ) : (
            <img
              src={item.imageUrl}
              alt={item.caption}
              className="w-full h-full object-contain"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="bg-ahly-card border-t border-ahly-border rounded-b-2xl p-4">
          <p className="text-sm text-white font-medium">{item.caption}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-ahly-muted">{item.matchTitle} — {item.date}</span>
            <span className="text-xs text-ahly-muted/50">{currentIndex + 1} / {items.length}</span>
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all border border-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all border border-white/10">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-ahly-card border border-ahly-border text-ahly-muted hover:text-white flex items-center justify-center transition-all text-lg leading-none">
          &times;
        </button>
      </div>
    </div>
  );
}