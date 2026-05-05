import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import { getRecentMatches, getUpcomingMatches } from '../services/api';
import { Match } from '../types';

type Tab = 'results' | 'upcoming';
type CompFilter = 'all' | 'league' | 'continental' | 'cup';

export default function Matches() {
  const [tab, setTab] = useState<Tab>('results');
  const [filter, setFilter] = useState<CompFilter>('all');
  const [recent, setRecent] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [r, u] = await Promise.all([getRecentMatches(), getUpcomingMatches()]);
      setRecent(r);
      setUpcoming(u);
      setLoading(false);
    }
    fetchData();
  }, []);

  const currentMatches = tab === 'results' ? recent : upcoming;
  const filtered =
    filter === 'all'
      ? currentMatches
      : currentMatches.filter((m) => m.competition.type === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Matches</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-ahly-card rounded-lg p-1 border border-ahly-border">
          <TabButton active={tab === 'results'} onClick={() => setTab('results')}>
            <ArrowLeft className="w-4 h-4" /> Results
          </TabButton>
          <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
            Upcoming <ArrowRight className="w-4 h-4" />
          </TabButton>
        </div>

        <div className="flex gap-2">
          {(['all', 'league', 'continental', 'cup'] as CompFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-ahly-red text-white'
                  : 'bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-ahly-red/30 border-t-ahly-red rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ahly-muted">No matches found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
        active ? 'bg-ahly-red text-white' : 'text-ahly-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
