import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Shield,
  TrendingUp,
  ChevronRight,
  Flame,
  Swords,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import StandingsTable from '../components/StandingsTable';
import NewsCard from '../components/NewsCard';
import CountdownTimer from '../components/CountdownTimer';
import { getRecentMatches, getUpcomingMatches, getStandings, getNews, getTeamStats } from '../services/api';
import { Match, Standing, NewsItem, TeamStats } from '../types';

export default function Dashboard() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [standingsData, setStandings] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [matches, upcomingData, standings, newsData, statsData] = await Promise.all([
          getRecentMatches(),
          getUpcomingMatches(),
          getStandings(),
          getNews(),
          getTeamStats(),
        ]);
        setRecentMatches(matches);
        setUpcoming(upcomingData);
        setStandings(standings);
        setNews(newsData);
        setStats(statsData);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <LoadingState />;

  const nextMatch = upcoming[0];
  const ahlyStanding = standingsData.find((s) => s.team.isAhly);

  return (
    <div className="space-y-6 animate-fade-in">
      {nextMatch && (
        <div className="ahly-gradient rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
              <path d="M50 5 L60 35 L95 35 L67 55 L77 85 L50 67 L23 85 L33 55 L5 35 L40 35 Z" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70 font-medium">Next Match</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              {nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <CountdownTimer targetDate={nextMatch.date} targetTime={nextMatch.time} />
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className={`competition-badge ${nextMatch.competition.type}`}>
                {nextMatch.competition.name}
              </span>
              <span>{nextMatch.venue}</span>
            </div>
          </div>
        </div>
      )}

      {stats && ahlyStanding && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox
            icon={<Trophy className="w-5 h-5 text-ahly-gold" />}
            label="League Position"
            value={`#${ahlyStanding.position}`}
            sub={`${ahlyStanding.points} pts`}
          />
          <StatBox
            icon={<Flame className="w-5 h-5 text-green-400" />}
            label="Win Rate"
            value={`${Math.round((stats.wins / stats.totalMatches) * 100)}%`}
            sub={`${stats.wins}W ${stats.draws}D ${stats.losses}L`}
          />
          <StatBox
            icon={<Target className="w-5 h-5 text-ahly-red" />}
            label="Top Scorer"
            value={stats.topScorer.name.split(' ').pop()!}
            sub={`${stats.topScorer.goals} goals`}
          />
          <StatBox
            icon={<Shield className="w-5 h-5 text-blue-400" />}
            label="Clean Sheets"
            value={String(stats.cleanSheets)}
            sub={`${stats.goalsConceded} conceded`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Recent Results" icon={<Flame />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentMatches.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>

          <SectionHeader title="Upcoming Fixtures" icon={<Swords />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title="League Table" icon={<Trophy />} link="/standings" />
          <div className="glass-card p-3">
            <StandingsTable standings={standingsData} compact />
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Latest News" icon={<TrendingUp />} link="/news" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.slice(0, 3).map((item, i) => (
            <NewsCard key={item.id} news={item} featured={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="stat-card">
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-ahly-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-ahly-muted mt-0.5">{sub}</p>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  link,
}: {
  title: string;
  icon: React.ReactNode;
  link: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="section-title">
        {icon}
        {title}
      </h2>
      <Link
        to={link}
        className="flex items-center gap-1 text-xs text-ahly-red hover:text-ahly-gold transition-colors"
      >
        View All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-ahly-red/30 border-t-ahly-red rounded-full animate-spin" />
        <p className="text-ahly-muted text-sm">Loading Al-Ahly data...</p>
      </div>
    </div>
  );
}
