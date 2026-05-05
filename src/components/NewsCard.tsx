import { NewsItem } from '../types';
import { format, parseISO } from 'date-fns';
import { ExternalLink, Clock } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const categoryColors: Record<string, string> = {
    match: 'bg-blue-500/20 text-blue-400',
    transfer: 'bg-purple-500/20 text-purple-400',
    injury: 'bg-red-500/20 text-red-400',
    award: 'bg-ahly-gold/20 text-ahly-gold',
    general: 'bg-ahly-muted/20 text-ahly-muted',
  };

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card group block overflow-hidden ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {news.imageUrl && (
        <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-40'}`}>
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ahly-dark via-transparent to-transparent" />
          {news.category && (
            <span
              className={`absolute top-3 left-3 badge ${
                categoryColors[news.category] || categoryColors.general
              }`}
            >
              {news.category}
            </span>
          )}
        </div>
      )}

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
