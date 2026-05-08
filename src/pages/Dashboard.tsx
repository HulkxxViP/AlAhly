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
  RefreshCw,
  RotateCcw,
  Activity,
  Goal,
  Clock,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import StandingsTable from '../components/StandingsTable';
import NewsCard from '../components/NewsCard';
import CountdownTimer from '../components/CountdownTimer';
import LiveScoreTicker from '../components/LiveScoreTicker';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';
import { getRecentMatches, getUpcomingMatches, getLiveMatch, getStandings, getNews, getTeamStats } from '../services/api';
import { Match, Standing, NewsItem, TeamStats, MatchEvent } from '../types';

export default function Dashboard() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [standingsData, setStandings] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestPermission, notify } = useNotifications();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [matches, upcomingData, live, standings, newsData, statsData] = await Promise.all([
          getRecentMatches(),
          getUpcomingMatches(),
          getLiveMatch(),
          getStandings(),
          getNews(),
          getTeamStats(),
        ]);
        setRecentMatches(matches);
        setUpcoming(upcomingData);
        setLiveMatch(live);
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
    if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    if (autoRefresh) {
      liveIntervalRef.current = setInterval(async () => {
        const live = await getLiveMatch();
        setLiveMatch(live);
      }, 30000);
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [autoRefresh]);

  useEffect(() => {
    if (!loading && !animatedStats) {
      const timer = setTimeout(() => setAnimatedStats(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, animatedStats]);

  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!liveMatch?.events) return;
    for (const event of liveMatch.events) {
      const key = `${event.minute}-${event.type}-${event.player}`;
      if (notifiedEvents.current.has(key)) continue;
      notifiedEvents.current.add(key);
      if (event.type === 'goal') {
        addToast({ type: 'goal', message: `GOAL! ${event.player} scores!`, team: event.team });
      } else if (event.type === 'red') {
        addToast({ type: 'red', message: `RED CARD! ${event.player} sent off!`, team: event.team });
      } else if (event.type === 'yellow') {
        addToast({ type: 'yellow', message: `Yellow card — ${event.player}`, team: event.team });
      }
    }
  }, [liveMatch?.events]);

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

      {liveMatch ? (
        <LiveMatchTracker match={liveMatch} />
      ) : nextMatch && (
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span className="text-sm text-white/80 font-medium tracking-wide uppercase">Next Match</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-12 mb-6">
              <div className="flex flex-col items-center gap-3 min-w-0">
                <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-ahly-dark/50 border-2 border-ahly-red/40 flex items-center justify-center p-1.5 animate-float shadow-lg shadow-ahly-red/30 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ahly-red/10 to-transparent animate-pulse-red" />
                  <LogoImage
                    src={nextMatch.homeTeam.logo}
                    name={nextMatch.homeTeam.name}
                    isAhly={true}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-white/90 text-center max-w-28 leading-tight">
                  {nextMatch.homeTeam.name}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-ahly-red/30 to-ahly-gold/20 border border-ahly-red/30 flex items-center justify-center animate-glow">
                  <span className="text-base md:text-lg font-black text-white">VS</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Matchup</span>
              </div>

              <div className="flex flex-col items-center gap-3 min-w-0">
                <div className={`relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-ahly-dark/50 border-2 flex items-center justify-center p-1.5 animate-float shadow-lg flex-shrink-0 ${nextMatch.awayTeam.isAhly ? 'border-ahly-red/40 shadow-ahly-red/30' : 'border-ahly-gold/30 shadow-ahly-gold/20'}`} style={{ animationDelay: '1.5s' }}>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${nextMatch.awayTeam.isAhly ? 'from-ahly-red/10 to-transparent' : 'from-ahly-gold/10 to-transparent'} animate-pulse-red`} />
                  <LogoImage
                    src={nextMatch.awayTeam.logo}
                    name={nextMatch.awayTeam.name}
                    isAhly={nextMatch.awayTeam.isAhly}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-white/90 text-center max-w-28 leading-tight truncate w-full">
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

function LiveMatchTracker({ match }: { match: Match }) {
  const [simMinute, setSimMinute] = useState(match.minute || 0);

  useEffect(() => {
    setSimMinute(match.minute || 0);
  }, [match.minute, match.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimMinute((prev) => {
        if (prev >= 90) return prev;
        if (prev < 45) return prev + 1;
        if (prev === 45) return prev + 15;
        return prev + 1;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isAhlyHome = match.homeTeam.isAhly;
  const isAhlyAway = match.awayTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const ahlyWinning = ahlyScore !== null && oppScore !== null && ahlyScore > oppScore;
  const isDraw = ahlyScore !== null && oppScore !== null && ahlyScore === oppScore;

  return (
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-sm font-bold text-red-300 tracking-wide">LIVE</span>
              <span className="text-sm font-bold text-white tabular-nums bg-red-500/30 px-1.5 py-0.5 rounded">
                {simMinute}&apos;
              </span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-white/60">
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-ahly-dark/50 text-white/60 border border-white/10'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              {autoRefresh ? 'On' : 'Off'}
            </button>
            <Link
              to="/live"
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all border border-white/10"
            >
              <Activity className="w-3 h-3" />
              Watch
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-10 mb-6">
          <div className="flex flex-col items-center gap-3 min-w-0">
            <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-ahly-dark/50 border-2 border-ahly-red/40 flex items-center justify-center p-1.5 animate-float shadow-lg shadow-ahly-red/30 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ahly-red/10 to-transparent animate-pulse-red" />
              <LogoImage
                src={match.homeTeam.logo}
                name={match.homeTeam.name}
                isAhly={true}
                className="w-full h-full"
              />
            </div>
            <span className="text-xs md:text-sm font-semibold text-white/90 text-center max-w-28 leading-tight truncate w-full">
              {match.homeTeam.name}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 md:gap-4">
              <span className={`text-5xl md:text-7xl font-black tabular-nums ${
                isAhlyHome && ahlyWinning ? 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]' : isAhlyHome ? 'text-white' : 'text-ahly-muted/60'
              }`}>
                {match.homeScore}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-white/40">:</span>
              <span className={`text-5xl md:text-7xl font-black tabular-nums ${
                isAhlyAway && ahlyWinning ? 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]' : isAhlyAway ? 'text-white' : 'text-ahly-muted/60'
              }`}>
                {match.awayScore}
              </span>
            </div>
            <span className={`text-xs font-bold mt-1 ${ahlyWinning ? 'text-green-400' : isDraw ? 'text-yellow-400' : match.status === 'halftime' ? 'text-ahly-gold' : 'text-red-300'}`}>
              {ahlyWinning ? 'AL AHLY LEADING' : isDraw && simMinute >= 45 ? 'DRAW' : match.status === 'halftime' ? 'HALF TIME' : 'IN PROGRESS'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 min-w-0">
            <div className={`relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-ahly-dark/50 border-2 flex items-center justify-center p-1.5 animate-float shadow-lg flex-shrink-0 ${match.awayTeam.isAhly ? 'border-ahly-red/40 shadow-ahly-red/30' : 'border-ahly-gold/30 shadow-ahly-gold/20'}`} style={{ animationDelay: '1.5s' }}>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${match.awayTeam.isAhly ? 'from-ahly-red/10 to-transparent' : 'from-ahly-gold/10 to-transparent'} animate-pulse-red`} />
              <LogoImage
                src={match.awayTeam.logo}
                name={match.awayTeam.name}
                isAhly={match.awayTeam.isAhly}
                className="w-full h-full"
              />
            </div>
            <span className="text-xs md:text-sm font-semibold text-white/90 text-center max-w-28 leading-tight truncate w-full">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/70 mb-5">
          <span className={`competition-badge ${match.competition.type}`}>
            {match.competition.name}
          </span>
          {match.venue && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {match.venue}
            </span>
          )}
        </div>

        {match.events && match.events.length > 0 && (
          <div className="bg-ahly-dark/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Goal className="w-4 h-4 text-ahly-gold" />
              <h3 className="text-sm font-bold text-white">Match Events</h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {match.events.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm animate-slide-right"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-xs text-ahly-muted w-10 tabular-nums font-medium">
                    {event.minute}&apos;
                  </span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ahly-dark/80">
                    {event.type === 'goal' && <span className="text-sm">⚽</span>}
                    {event.type === 'yellow' && <span className="text-sm">🟨</span>}
                    {event.type === 'red' && <span className="text-sm">🟥</span>}
                    {event.type === 'substitution' && <span className="text-xs">🔄</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-medium truncate block ${
                        (event.team === 'home' && isAhlyHome) || (event.team === 'away' && isAhlyAway)
                          ? 'text-white'
                          : 'text-ahly-muted'
                      }`}
                    >
                      {event.player}
                    </span>
                  </div>
                  {event.type === 'goal' && (
                    <span className="text-lg font-bold tabular-nums text-ahly-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                      {match.homeScore ?? '-'}:{match.awayScore ?? '-'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogoImage({ src, name, isAhly, className }: { src?: string; name: string; isAhly?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center relative z-10 ${className || ''}`}>
        <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${isAhly ? 'from-ahly-red/30 to-ahly-red/10' : 'from-ahly-gold/20 to-ahly-dark/60'}`}>
          <span className={`text-lg md:text-xl font-bold ${isAhly ? 'text-ahly-red' : 'text-ahly-gold/70'}`}>
            {initials}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`w-full h-full object-contain relative z-10 ${className || ''}`}
      style={{ filter: isAhly ? 'drop-shadow(0 2px 12px rgba(200,16,46,0.4))' : 'none' }}
      onError={() => setFailed(true)}
    />
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
