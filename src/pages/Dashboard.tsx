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
  const statsRef = useRef<HTMLDivElement>(null);
  const livePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestPermission, notify } = useNotifications();
  const { addToast } = useToast();
  const [dashboardEventIndex, setDashboardEventIndex] = useState(0);

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
    if (livePollingRef.current) clearInterval(livePollingRef.current);
    livePollingRef.current = setInterval(async () => {
      const live = await getLiveMatch();
      setLiveMatch(live);
    }, 30000);
    return () => {
      if (livePollingRef.current) clearInterval(livePollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading && !animatedStats) {
      const timer = setTimeout(() => setAnimatedStats(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, animatedStats]);

  useEffect(() => {
    if (!liveMatch?.events || liveMatch.events.length <= 1) return;
    const tick = setInterval(() => {
      setDashboardEventIndex((prev) =>
        prev >= (liveMatch.events?.length ?? 1) - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(tick);
  }, [liveMatch?.events?.length]);

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

      {liveMatch && liveMatch.status === 'live' && (
        <DashboardLiveBar match={liveMatch} eventIndex={dashboardEventIndex} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nextMatch && (
          <NextMatchHero match={nextMatch} />
        )}

        {liveMatch && liveMatch.status === 'live' ? (
          <LiveMatchCard match={liveMatch} />
        ) : nextMatch ? (
          <LiveWaitingCard match={nextMatch} />
        ) : (
          <LiveWaitingCard />
        )}
      </div>

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

function NextMatchHero({ match: nextMatch }: { match: Match }) {
  return (
    <div className="ahly-gradient rounded-2xl p-6 md:p-8 relative overflow-hidden h-full">
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

      <div className="relative z-10 h-full flex flex-col justify-center">
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
  );
}

function DashboardLiveBar({ match, eventIndex: _ei }: { match: Match; eventIndex: number }) {
  const isAhlyHome = match.homeTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const oppTeam = isAhlyHome ? match.awayTeam.name : match.homeTeam.name;
  const events = match.events || [];
  const event = events[_ei];

  return (
    <div className="bg-gradient-to-r from-ahly-dark via-ahly-card to-ahly-dark border border-ahly-border/30 rounded-xl px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 py-2 text-[11px] overflow-hidden">
        <Link to="/live" className="flex items-center gap-1.5 shrink-0 group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 tracking-wide">LIVE</span>
        </Link>

        <span className="text-ahly-text font-semibold truncate max-w-[80px]">Al Ahly</span>
        <span className="font-bold text-white tabular-nums bg-ahly-dark/60 px-1.5 py-0.5 rounded">
          {ahlyScore ?? '-'}:{oppScore ?? '-'}
        </span>
        <span className="text-ahly-muted truncate max-w-[80px] hidden sm:inline">{oppTeam}</span>
        {match.minute && (
          <span className="text-red-400 font-bold text-[10px]">{match.minute}&apos;</span>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-ahly-muted flex-1 min-w-0 border-l border-ahly-border/20 pl-2">
          {event ? (
            <span className="animate-slide-right truncate flex items-center gap-1" key={`${event.minute}-${event.type}`}>
              <span>{event.type === 'goal' ? '⚽' : event.type === 'yellow' ? '🟨' : event.type === 'red' ? '🟥' : '🔄'}</span>
              <span className="tabular-nums">{event.minute}&apos;</span>
              <span className="truncate">{event.player}</span>
            </span>
          ) : (
            <span className="text-ahly-muted/40">No events</span>
          )}
          {events.length > 1 && (
            <span className="text-[10px] text-ahly-muted/30 shrink-0 ml-auto">{_ei + 1}/{events.length}</span>
          )}
        </div>

        <Link to="/live" className="ml-auto shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-ahly-red/15 text-ahly-red border border-ahly-red/20 hover:bg-ahly-red/25 transition-all text-[10px] font-medium">
          Watch <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  );
}

function LiveMatchCard({ match }: { match: Match }) {
  const isAhlyHome = match.homeTeam.isAhly;
  const isAhlyAway = match.awayTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const ahlyWinning = ahlyScore !== null && oppScore !== null && ahlyScore > oppScore;
  const isDraw = ahlyScore !== null && oppScore !== null && ahlyScore === oppScore;

  return (
    <Link to="/live" className="block h-full">
      <div className="bg-gradient-to-br from-ahly-red/20 via-ahly-card to-ahly-dark border border-ahly-red/30 rounded-2xl p-5 relative overflow-hidden h-full hover:border-ahly-red/50 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05]">
          <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-400 tracking-wide">LIVE</span>
            {match.minute && (
              <span className="text-xs font-bold text-white tabular-nums bg-red-500/20 px-1.5 py-0.5 rounded ml-1">
                {match.minute}&apos;
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-ahly-dark/60 border-2 border-ahly-red/30 flex items-center justify-center p-1">
                <LogoImage src={match.homeTeam.logo} name={match.homeTeam.name} isAhly={true} className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/70 text-center leading-tight truncate w-full max-w-16">
                {match.homeTeam.name}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className={`text-2xl md:text-3xl font-black tabular-nums ${
                  isAhlyHome && ahlyWinning ? 'text-green-400' : 'text-white'
                }`}>
                  {match.homeScore}
                </span>
                <span className="text-lg font-bold text-white/40">:</span>
                <span className={`text-2xl md:text-3xl font-black tabular-nums ${
                  isAhlyAway && ahlyWinning ? 'text-green-400' : 'text-white'
                }`}>
                  {match.awayScore}
                </span>
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${ahlyWinning ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-300'}`}>
                {ahlyWinning ? 'LEADING' : isDraw ? 'DRAW' : 'TRAILING'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-ahly-dark/60 border-2 flex items-center justify-center p-1 ${match.awayTeam.isAhly ? 'border-ahly-red/30' : 'border-ahly-gold/20'}`}>
                <LogoImage src={match.awayTeam.logo} name={match.awayTeam.name} isAhly={match.awayTeam.isAhly} className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/70 text-center leading-tight truncate w-full max-w-16">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/50 border-t border-white/10 pt-2">
            <span>{match.competition.name}</span>
            <span className="flex items-center gap-1 text-ahly-red group-hover:gap-1.5 transition-all">
              Watch <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LiveWaitingCard({ match }: { match?: Match }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!match) return;
    const target = new Date(`${match.date}T${match.time}:00`);
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [match?.date, match?.time]);

  return (
    <div className="bg-gradient-to-br from-ahly-card/50 to-ahly-dark border border-ahly-border/50 rounded-2xl p-5 md:p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.04]">
        <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
        {match ? (
          <>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ahly-gold" />
              <span className="text-xs text-ahly-gold font-bold tracking-wide uppercase">Next Match</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ahly-dark/70 border border-ahly-red/30 flex items-center justify-center p-1">
                <LogoImage src={match.homeTeam.logo} name={match.homeTeam.name} isAhly={true} className="w-full h-full" />
              </div>
              <span className="text-xs text-ahly-muted font-medium">vs</span>
              <div className={`w-10 h-10 rounded-full bg-ahly-dark/70 border flex items-center justify-center p-1 ${match.awayTeam.isAhly ? 'border-ahly-red/30' : 'border-ahly-gold/20'}`}>
                <LogoImage src={match.awayTeam.logo} name={match.awayTeam.name} isAhly={match.awayTeam.isAhly} className="w-full h-full" />
              </div>
            </div>

            <p className="text-sm text-white/80 font-semibold text-center">{match.homeTeam.name} vs {match.awayTeam.name}</p>

            <div className="flex items-center gap-1 tabular-nums text-lg">
              {timeLeft.d > 0 && (
                <span className="bg-ahly-card border border-ahly-border rounded px-2 py-1">
                  <span className="text-white font-bold">{timeLeft.d}</span>
                  <span className="text-ahly-muted text-[10px] ml-0.5">d</span>
                </span>
              )}
              <span className="bg-ahly-card border border-ahly-border rounded px-2 py-1">
                <span className="text-white font-bold">{String(timeLeft.h).padStart(2, '0')}</span>
                <span className="text-ahly-muted text-[10px] ml-0.5">h</span>
              </span>
              <span className="text-white font-bold text-lg">:</span>
              <span className="bg-ahly-card border border-ahly-border rounded px-2 py-1">
                <span className="text-white font-bold">{String(timeLeft.m).padStart(2, '0')}</span>
                <span className="text-ahly-muted text-[10px] ml-0.5">m</span>
              </span>
              <span className="text-white font-bold text-lg">:</span>
              <span className="bg-ahly-card border border-ahly-border rounded px-2 py-1">
                <span className="text-white font-bold">{String(timeLeft.s).padStart(2, '0')}</span>
                <span className="text-ahly-muted text-[10px] ml-0.5">s</span>
              </span>
            </div>

            <p className="text-[10px] text-ahly-muted/50 text-center">
              Match starts soon &mdash; live events will appear here automatically
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-ahly-card border border-ahly-border flex items-center justify-center">
              <Clock className="w-6 h-6 text-ahly-muted/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-ahly-muted font-medium">No Live Matches</p>
              <p className="text-[10px] text-ahly-muted/50 mt-1">Waiting for the next match to begin</p>
            </div>
          </>
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
