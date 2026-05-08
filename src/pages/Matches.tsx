import { useState, useEffect, useMemo } from 'react';
import { Calendar, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import { getRecentMatches, getUpcomingMatches } from '../services/api';
import { Match, Competition } from '../types';

type Tab = 'results' | 'upcoming';

export default function Matches() {
  const [tab, setTab] = useState<Tab>('results');
  const [compFilter, setCompFilter] = useState<number | 'all'>('all');
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

  const competitions = useMemo(() => {
    const all = [...recent, ...upcoming];
    const map = new Map<number, Competition>();
    for (const m of all) {
      if (!map.has(m.competition.id)) {
        map.set(m.competition.id, m.competition);
      }
    }
    return Array.from(map.values());
  }, [recent, upcoming]);

  const currentMatches = tab === 'results' ? recent : upcoming;
  const filtered =
    compFilter === 'all'
      ? currentMatches
      : currentMatches.filter((m) => m.competition.id === compFilter);

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Matches</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex bg-ahly-card rounded-lg p-1 border border-ahly-border">
              <TabButton active={tab === 'results'} onClick={() => setTab('results')}>
                <ArrowLeft className="w-4 h-4" /> Results
              </TabButton>
              <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
                Upcoming <ArrowRight className="w-4 h-4" />
              </TabButton>
            </div>

            <div className="relative">
              <select
                value={compFilter === 'all' ? 'all' : String(compFilter)}
                onChange={(e) => setCompFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="appearance-none bg-ahly-card text-sm text-white border border-ahly-border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-ahly-red cursor-pointer"
              >
                <option value="all">All Competitions</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ahly-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ahly-muted">No matches found for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade">
              {filtered.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </>
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
