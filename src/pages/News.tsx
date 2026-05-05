import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { getNews } from '../services/api';
import { NewsItem } from '../types';

type Category = 'all' | 'match' | 'transfer' | 'injury' | 'award' | 'general';

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchNews() {
    const data = await getNews();
    setNews(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchNews();
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">Latest News</h1>
        </div>
        <button
          onClick={() => {
            setRefreshing(true);
            fetchNews();
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-ahly-card text-ahly-muted
            hover:text-white border border-ahly-border transition-all text-sm ${
              refreshing ? 'animate-spin' : ''
            }`}
          disabled={refreshing}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
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
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-ahly-red/30 border-t-ahly-red rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ahly-muted">No news in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <NewsCard key={item.id} news={item} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
