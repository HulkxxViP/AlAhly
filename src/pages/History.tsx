import { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Trophy,
  TrendingUp,
  Target,
  Shield,
  Award,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import MatchCard from '../components/MatchCard';
import { getHistory, getRecentMatches, getTeamStats } from '../services/api';
import { Match, TeamStats } from '../types';

function getSeason(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [recent, setRecent] = useState<Match[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'league' | 'continental' | 'cup' | 'international'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'draw' | 'loss'>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchData() {
      const [history, recentData, statsData] = await Promise.all([
        getHistory(),
        getRecentMatches(),
        getTeamStats(),
      ]);
      setAllMatches(history);
      setRecent(recentData);
      setStats(statsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const combined = useMemo(() => {
    const all = [...recent, ...allMatches];
    const unique = all.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
    return unique;
  }, [recent, allMatches]);

  const seasons = useMemo(() => {
    const set = new Set(combined.map((m) => getSeason(m.date)));
    return Array.from(set).sort();
  }, [combined]);

  const filtered = useMemo(() => {
    let items = [...combined];

    if (seasonFilter !== 'all') {
      items = items.filter((m) => getSeason(m.date) === seasonFilter);
    }

    if (filter !== 'all') {
      items = items.filter((m) => m.competition.type === filter);
    }

    if (resultFilter !== 'all') {
      items = items.filter((m) => {
        if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) return false;
        const isAhlyHome = m.homeTeam.isAhly;
        const isAhlyAway = m.awayTeam.isAhly;
        const ahlyScore = isAhlyHome ? m.homeScore : isAhlyAway ? m.awayScore : 0;
        const oppScore = isAhlyHome ? m.awayScore : isAhlyAway ? m.homeScore : 0;
        if (resultFilter === 'win') return ahlyScore > oppScore;
        if (resultFilter === 'draw') return ahlyScore === oppScore;
        if (resultFilter === 'loss') return ahlyScore < oppScore;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.competition.name.toLowerCase().includes(q) ||
          m.venue?.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return items;
  }, [combined, filter, resultFilter, seasonFilter, search, sortOrder]);

  const wins = combined.filter((m) => {
    if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) return false;
    return (m.homeTeam.isAhly && m.homeScore > m.awayScore) ||
      (m.awayTeam.isAhly && m.awayScore > m.homeScore);
  }).length;

  const draws = combined.filter((m) => {
    if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) return false;
    return m.homeScore === m.awayScore;
  }).length;

  const losses = combined.filter((m) => {
    if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) return false;
    return (m.homeTeam.isAhly && m.homeScore < m.awayScore) ||
      (m.awayTeam.isAhly && m.awayScore < m.homeScore);
  }).length;

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-7 h-7 text-ahly-red" />
<h1 className="page-header mb-0">{t('history.title')}</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">{t('history.title')}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 stagger-fade">
        <QuickStat icon={<Trophy className="w-4 h-4 text-ahly-gold" />} label="Total" value={String(combined.length)} />
        <QuickStat icon={<TrendingUp className="w-4 h-4 text-green-400" />} label={t('common.win')} value={String(wins)} />
        <QuickStat icon={<Target className="w-4 h-4 text-yellow-400" />} label={t('common.draw')} value={String(draws)} />
        <QuickStat icon={<Shield className="w-4 h-4 text-red-400" />} label={t('common.loss')} value={String(losses)} />
        <QuickStat icon={<Award className="w-4 h-4 text-purple-400" />} label={t('dashboard.winRate')} value={combined.length ? `${Math.round((wins / combined.length) * 100)}%` : '0%'} />
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ahly-muted" />
          <input
            type="text"
            placeholder={t('header.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ahly-card border border-ahly-border rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder:text-ahly-muted/50 outline-none focus:border-ahly-red/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-ahly-red/50 transition-colors"
          >
            <option value="all">{t('matches.allCompetitions')}</option>
            <option value="league">League</option>
            <option value="continental">Continental</option>
            <option value="cup">Cup</option>
            <option value="international">International</option>
          </select>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as typeof resultFilter)}
            className="bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-ahly-red/50 transition-colors"
          >
            <option value="all">{t('matches.allCompetitions')}</option>
            <option value="win">{t('common.win')}</option>
            <option value="draw">{t('common.draw')}</option>
            <option value="loss">{t('common.loss')}</option>
          </select>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-ahly-red/50 transition-colors"
          >
            <option value="all">All Seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border transition-all text-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 rounded-lg bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border transition-all text-xs"
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <History className="w-12 h-12 text-ahly-muted mx-auto mb-3" />
          <p className="text-ahly-muted">No matches found matching your filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="glass-card-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-ahly-muted border-b border-ahly-border">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Competition</th>
                <th className="text-left py-3 px-4">Match</th>
                <th className="text-center py-3 px-4">Score</th>
                <th className="text-center py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((match) => {
                const isAhlyHome = match.homeTeam.isAhly;
                const isAhlyAway = match.awayTeam.isAhly;
                const ahlyWon = match.status === 'finished' && match.homeScore !== null && match.awayScore !== null &&
                  ((isAhlyHome && match.homeScore > match.awayScore) || (isAhlyAway && match.awayScore > match.homeScore));
                const ahlyDrew = match.status === 'finished' && match.homeScore !== null && match.awayScore !== null &&
                  match.homeScore === match.awayScore;
                const resultColor = ahlyWon ? 'text-green-400' : ahlyDrew ? 'text-yellow-400' : 'text-red-400';
                const resultText = ahlyWon ? 'W' : ahlyDrew ? 'D' : 'L';

                return (
                  <tr key={match.id} className="border-b border-ahly-border/30 hover:bg-ahly-card/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-ahly-muted whitespace-nowrap">{match.date}</td>
                    <td className="py-3 px-4">
                      <span className={`competition-badge ${match.competition.type}`}>{match.competition.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">{match.homeTeam.name} vs {match.awayTeam.name}</td>
                    <td className="py-3 px-4 text-center text-sm font-bold text-white">
                      {match.status === 'finished' ? `${match.homeScore} - ${match.awayScore}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {match.status === 'finished' && (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${resultColor.replace('text-', 'bg-').replace('400', '500/80')} ${resultColor}`}>
                          {resultText}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card-elevated p-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-[10px] text-ahly-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
