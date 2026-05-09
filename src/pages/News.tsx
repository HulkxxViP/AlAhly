import { useState, useEffect, useRef } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { useLanguage } from '../context/LanguageContext';
import { getNews } from '../services/api';
import { NewsItem } from '../types';

type Category = 'all' | 'match' | 'transfer' | 'injury' | 'award' | 'general';

export default function News() {
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchNews() {
    const data = await getNews();
    setNews(data);
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    fetchNews();
    intervalRef.current = setInterval(fetchNews, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const filtered =
    filter === 'all' ? news : news.filter((n) => n.category === filter);

  const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All News' },
    { value: 'match', label: 'Matches' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'injury', label: 'Injuries' },
    { value: 'award', label: 'Awards' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">{t('news.latest')}</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-ahly-muted hidden sm:block">
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchNews();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border transition-all text-sm disabled:opacity-60"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
{t('live.refresh')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === cat.value
                ? 'bg-ahly-red text-white'
                : 'bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ahly-muted">No news in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade">
          {filtered.map((item, i) => (
            <NewsCard key={item.id} news={item} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
