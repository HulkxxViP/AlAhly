import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Shield,
  TrendingUp,
  ChevronRight,
  Flame,
  Swords,
  Bell,
  BellOff,
  Zap,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import StandingsTable from '../components/StandingsTable';
import NewsCard from '../components/NewsCard';
import CountdownTimer from '../components/CountdownTimer';
import LiveScoreTicker from '../components/LiveScoreTicker';
import { useNotifications } from '../hooks/useNotifications';
import { getRecentMatches, getUpcomingMatches, getStandings, getNews, getTeamStats } from '../services/api';
import { Match, Standing, NewsItem, TeamStats } from '../types';

export default function Dashboard() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [standingsData, setStandings] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { requestPermission, notify } = useNotifications();

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

  useEffect(() => {
    if (!loading && !animatedStats) {
      const timer = setTimeout(() => setAnimatedStats(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, animatedStats]);

  if (loading) return <DashboardSkeleton />;

  const nextMatch = upcoming[0];
  const ahlyStanding = standingsData.find((s) => s.team.isAhly);

  return (
    <div className="space-y-6 page-enter">
      <LiveScoreTicker />

      <div className="flex items-center justify-end">
        <button
          onClick={async () => {
            if (notificationsOn) {
              setNotificationsOn(false);
            } else {
              const granted = await requestPermission();
              if (granted) {
                setNotificationsOn(true);
                notify('Notifications Enabled', { body: 'You will receive match updates.' });
              }
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            notificationsOn
              ? 'bg-ahly-red/20 text-ahly-red border border-ahly-red/30'
              : 'bg-ahly-card text-ahly-muted border border-ahly-border hover:text-white'
          }`}
        >
          {notificationsOn ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          {notificationsOn ? 'Notifications On' : 'Enable Alerts'}
        </button>
      </div>

      {nextMatch && (
        <div className="ahly-gradient rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.06] animate-float-slow">
              <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 opacity-[0.04] animate-float" style={{ animationDelay: '2s' }}>
              <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute top-1/2 left-1/3 w-32 h-32 opacity-[0.03] animate-float" style={{ animationDelay: '1s' }}>
              <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-sm text-white/80 font-medium tracking-wide uppercase">Next Match</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-8 mb-5">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-ahly-dark/50 border-2 border-ahly-red/40 flex items-center justify-center p-1 animate-float shadow-lg shadow-ahly-red/20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ahly-red/10 to-transparent animate-pulse-red" />
                  <img
                    src={nextMatch.homeTeam.logo || `${import.meta.env.BASE_URL}ahly-logo.png`}
                    alt={nextMatch.homeTeam.name}
                    className="w-full h-full object-contain relative z-10"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(200,16,46,0.3))' }}
                  />
                </div>
                <span className="text-xs font-semibold text-white/90 text-center max-w-24 leading-tight">
                  {nextMatch.homeTeam.name}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-ahly-red/30 to-ahly-gold/20 border border-ahly-red/30 flex items-center justify-center animate-glow">
                  <span className="text-sm md:text-base font-black text-white">VS</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Matchup</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-ahly-dark/50 border-2 flex items-center justify-center p-1 animate-float shadow-lg ${nextMatch.awayTeam.isAhly ? 'border-ahly-red/40' : 'border-ahly-gold/30'}`} style={{ animationDelay: '1.5s' }}>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${nextMatch.awayTeam.isAhly ? 'from-ahly-red/10 to-transparent' : 'from-ahly-gold/10 to-transparent'} animate-pulse-red`} />
                  <img
                    src={nextMatch.awayTeam.logo || ''}
                    alt={nextMatch.awayTeam.name}
                    className="w-full h-full object-contain relative z-10"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {!nextMatch.awayTeam.logo && (
                    <span className="text-lg font-bold text-ahly-muted/50 relative z-10">
                      {nextMatch.awayTeam.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-white/90 text-center max-w-24 leading-tight">
                  {nextMatch.awayTeam.name}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <CountdownTimer targetDate={nextMatch.date} targetTime={nextMatch.time} />
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className={`competition-badge ${nextMatch.competition.type}`}>
                {nextMatch.competition.name}
              </span>
              {nextMatch.venue && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {nextMatch.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {stats && ahlyStanding && (
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-fade">
          <StatBox
            icon={<Trophy className="w-5 h-5 text-ahly-gold" />}
            label="League Position"
            value={`#${ahlyStanding.position}`}
            sub={`${ahlyStanding.points} pts`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Flame className="w-5 h-5 text-green-400" />}
            label="Win Rate"
            value={`${Math.round((stats.wins / stats.totalMatches) * 100)}%`}
            sub={`${stats.wins}W ${stats.draws}D ${stats.losses}L`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Target className="w-5 h-5 text-ahly-red" />}
            label="Top Scorer"
            value={stats.topScorer.name.split(' ').pop()!}
            sub={`${stats.topScorer.goals} goals`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Shield className="w-5 h-5 text-blue-400" />}
            label="Clean Sheets"
            value={String(stats.cleanSheets)}
            sub={`${stats.goalsConceded} conceded`}
            animate={animatedStats}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Recent Results" icon={<Flame />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-fade">
            {recentMatches.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>

          <SectionHeader title="Upcoming Fixtures" icon={<Swords />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-fade">
            {upcoming.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title="League Table" icon={<Trophy />} link="/standings" />
          <div className="glass-card-elevated p-3">
            <StandingsTable standings={standingsData} compact />
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Latest News" icon={<TrendingUp />} link="/news" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade">
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
  animate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  animate?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(animate ? value : '0');
  const prevValue = useRef('0');

  useEffect(() => {
    if (!animate) return;
    const numVal = parseInt(value.replace(/[^0-9]/g, ''));
    const prevNum = parseInt(prevValue.current.replace(/[^0-9]/g, '')) || 0;
    if (numVal === prevNum || isNaN(numVal)) {
      setDisplayValue(value);
      return;
    }
    const steps = 20;
    let step = 0;
    const prefix = value.replace(/[0-9]/g, '');
    const suffix = value.replace(/^[0-9]+/, '');
    const cleanNum = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(cleanNum)) { setDisplayValue(value); return; }

    const interval = setInterval(() => {
      step++;
      const current = Math.round((cleanNum / steps) * step);
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(`${prefix}${current}${suffix}`);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [animate, value]);

  return (
    <div className="stat-card animate-scale-in">
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-ahly-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{displayValue}</p>
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6 page-enter">
      <div className="skeleton h-12 w-full" />
      <div className="flex justify-between">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-8 w-32 rounded-lg" />
      </div>
      <div className="skeleton h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="skeleton h-6 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
          <div className="skeleton h-6 w-44" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
