import { NewsItem } from '../types';
import { format, parseISO } from 'date-fns';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

const categoryStyles: Record<string, { bg: string; badge: string; gradient: string }> = {
  match: { bg: 'bg-blue-500/20', badge: 'bg-blue-500/20 text-blue-400', gradient: 'from-blue-900/20 via-blue-900/10 to-transparent' },
  transfer: { bg: 'bg-purple-500/20', badge: 'bg-purple-500/20 text-purple-400', gradient: 'from-purple-900/20 via-purple-900/10 to-transparent' },
  injury: { bg: 'bg-red-500/20', badge: 'bg-red-500/20 text-red-400', gradient: 'from-red-900/20 via-red-900/10 to-transparent' },
  award: { bg: 'bg-ahly-gold/20', badge: 'bg-ahly-gold/20 text-ahly-gold', gradient: 'from-yellow-900/20 via-yellow-900/10 to-transparent' },
  general: { bg: 'bg-ahly-muted/20', badge: 'bg-ahly-muted/20 text-ahly-muted', gradient: 'from-green-900/20 via-green-900/10 to-transparent' },
};

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const style = categoryStyles[news.category || 'general'];

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card-elevated group block overflow-hidden card-lift ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-40'}`}>
        {news.imageUrl ? (
          <>
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('no-image');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ahly-dark via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${style.bg}`}>
            <Newspaper className="w-10 h-10 text-ahly-muted/40" />
          </div>
        )}
        <span className={`absolute top-3 left-3 badge ${style.badge}`}>
          {news.category}
        </span>
      </div>

      <div className="p-4">
        <h3
          className={`font-semibold text-white group-hover:text-ahly-red transition-colors line-clamp-2 ${
            featured ? 'text-lg' : 'text-sm'
          }`}
        >
          {news.title}
        </h3>

        {(featured || !news.imageUrl) && (
          <p className="text-sm text-ahly-muted mt-2 line-clamp-2">{news.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-ahly-muted">
            <Clock className="w-3 h-3" />
            <span>{format(parseISO(news.publishedAt), 'MMM d, yyyy')}</span>
            <span className="text-ahly-border">|</span>
            <span>{news.source}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-ahly-muted group-hover:text-ahly-red transition-colors" />
        </div>
      </div>
    </a>
  );
}
