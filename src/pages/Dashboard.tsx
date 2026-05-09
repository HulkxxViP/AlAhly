import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Shield,
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
  Camera,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import StandingsTable from '../components/StandingsTable';
import NewsCard from '../components/NewsCard';
import CountdownTimer from '../components/CountdownTimer';
import LiveScoreTicker from '../components/LiveScoreTicker';
import MatchGallery from '../components/MatchGallery';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRecentMatches, getUpcomingMatches, getLiveMatch, getStandings, getTeamStats } from '../services/api';
import { Match, Standing, TeamStats, MatchEvent } from '../types';
import FootballFirstTeam from '../components/FootballFirstTeam';
import TrophyCabinet from '../components/TrophyCabinet';

const OFFICIAL_LOGO = 'https://alahlyegypt.com/_next/image?url=%2Flogo.png&w=320&q=75';

export default function Dashboard() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [standingsData, setStandings] = useState<Standing[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const livePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestPermission, notify } = useNotifications();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [dashboardEventIndex, setDashboardEventIndex] = useState(0);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [matches, upcomingData, live, standings, statsData] = await Promise.all([
          getRecentMatches(),
          getUpcomingMatches(),
          getLiveMatch(),
          getStandings(),
          getTeamStats(),
        ]);
        setRecentMatches(matches);
        setUpcoming(upcomingData);
        setLiveMatch(live);
        setStandings(standings);
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
          {notificationsOn ? t('dashboard.notificationsOn') : t('dashboard.enableAlerts')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nextMatch && (
          <NextMatchHero match={nextMatch} />
        )}

        {liveMatch && liveMatch.status === 'live' ? (
          <LiveMatchCard match={liveMatch} eventIndex={dashboardEventIndex} />
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
            label={t('dashboard.leaguePosition')}
            value={`#${ahlyStanding.position}`}
            sub={`${ahlyStanding.points} ${t('dashboard.pts')}`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Flame className="w-5 h-5 text-green-400" />}
            label={t('dashboard.winRate')}
            value={`${Math.round((stats.wins / stats.totalMatches) * 100)}%`}
            sub={`${stats.wins}W ${stats.draws}D ${stats.losses}L`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Target className="w-5 h-5 text-ahly-red" />}
            label={t('dashboard.topScorer')}
            value={stats.topScorer.name.split(' ').pop()!}
            sub={`${stats.topScorer.goals} ${t('dashboard.goals')}`}
            animate={animatedStats}
          />
          <StatBox
            icon={<Shield className="w-5 h-5 text-blue-400" />}
            label={t('dashboard.cleanSheets')}
            value={String(stats.cleanSheets)}
            sub={`${stats.goalsConceded} ${t('dashboard.conceded')}`}
            animate={animatedStats}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title={t('dashboard.recentResults')} icon={<Flame />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-fade">
            {recentMatches.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>

          <SectionHeader title={t('dashboard.upcomingFixtures')} icon={<Swords />} link="/matches" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-fade">
            {upcoming.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title={t('dashboard.leagueTable')} icon={<Trophy />} link="/standings" />
          <div className="glass-card-elevated p-3">
            <StandingsTable standings={standingsData} compact />
          </div>
        </div>
      </div>

      <div className="border-t border-ahly-border/30 pt-6">
        <FootballFirstTeam />
      </div>

      <div className="border-t border-ahly-border/30 pt-6">
        <TrophyCabinet />
      </div>

      <div>
        <SectionHeader title={t('dashboard.latestPhotos')} icon={<Camera />} link="/media" />
        <MatchGallery limit={10} />
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
  const { t } = useLanguage();
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
        {t('dashboard.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function NextMatchHero({ match: nextMatch }: { match: Match }) {
  const { t } = useLanguage();
  const tickerItems = [
    { text: nextMatch.competition.name, icon: '🏆' },
    { text: nextMatch.venue || 'Venue TBD', icon: '📍' },
    { text: `${nextMatch.date} at ${nextMatch.time}`, icon: '📅' },
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-ahly-red/15 via-ahly-card to-ahly-dark border border-ahly-red/30 rounded-2xl p-6 md:p-8 relative overflow-hidden h-full hover:border-ahly-red/50 transition-all group animate-pulse-glow">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.06] animate-float-slow">
          <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 opacity-[0.04] animate-float" style={{ animationDelay: '2s' }}>
          <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 opacity-[0.03] animate-float" style={{ animationDelay: '1s' }}>
          <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-ahly-red/50 to-transparent animate-shimmer" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ahly-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ahly-gold" />
              </span>
              <span className="text-sm text-ahly-gold font-bold tracking-wide uppercase" style={{textShadow: '0 0 10px rgba(212,175,55,0.3)'}}>
                {t('dashboard.nextMatch')}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 border-l border-white/10 pl-3 ml-2">
            <span className="animate-slide-right flex items-center gap-1" key={tickerIndex}>
              <span>{tickerItems[tickerIndex].icon}</span>
              <span className="truncate max-w-[140px]">{tickerItems[tickerIndex].text}</span>
            </span>
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
              <span className="text-base md:text-lg font-black text-white">{t('common.vs')}</span>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{t('dashboard.matchup')}</span>
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

function LiveMatchCard({ match, eventIndex: _ei }: { match: Match; eventIndex: number }) {
  const { t } = useLanguage();
  const isAhlyHome = match.homeTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const oppTeam = isAhlyHome ? match.awayTeam.name : match.homeTeam.name;
  const events = match.events || [];
  const event = events[_ei];

  return (
    <Link to="/live" className="block h-full">
      <div className="bg-gradient-to-br from-ahly-red/15 via-ahly-card to-ahly-dark border border-ahly-red/30 rounded-2xl p-5 relative overflow-hidden h-full hover:border-ahly-red/50 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05]">
          <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-400 tracking-wide">{t('common.live')}</span>
            {match.minute && (
              <span className="text-xs font-bold text-white tabular-nums bg-red-500/20 px-1.5 py-0.5 rounded">
                {match.minute}&apos;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-ahly-text font-semibold">Al Ahly</span>
            <span className="text-base font-black text-white tabular-nums bg-ahly-dark/60 px-2 py-0.5 rounded leading-none">
              {ahlyScore ?? '-'}:{oppScore ?? '-'}
            </span>
            <span className="text-sm text-ahly-muted truncate">{oppTeam}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ahly-muted border-t border-ahly-border/20 pt-3">
            {event ? (
              <span className="animate-slide-right flex items-center gap-1.5" key={`${event.minute}-${event.type}`}>
                {event.type === 'goal' ? <span className="text-sm">⚽</span> : event.type === 'yellow' ? <span>🟨</span> : event.type === 'red' ? <span>🟥</span> : <span>🔄</span>}
                <span className="tabular-nums font-medium">{event.minute}&apos;</span>
                <span className="truncate">{event.player}</span>
              </span>
            ) : (
              <span className="text-ahly-muted/40">{t('header.noEvents')}</span>
            )}
            {events.length > 1 && (
              <span className="text-[10px] text-ahly-muted/30 ml-auto shrink-0">{_ei + 1}/{events.length}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-white/10 pt-3">
            <span className="text-ahly-muted/60 font-medium">{match.competition.name}</span>
            <span className="flex items-center gap-1 text-ahly-red group-hover:gap-1.5 transition-all font-medium">
              {t('header.watch')} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LiveWaitingCard({ match }: { match?: Match }) {
  const { t } = useLanguage();
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
        <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
        {match ? (
          <>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ahly-gold" />
              <span className="text-xs text-ahly-gold font-bold tracking-wide uppercase">{t('dashboard.nextMatch')}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ahly-dark/70 border border-ahly-red/30 flex items-center justify-center p-1">
                <LogoImage src={match.homeTeam.logo} name={match.homeTeam.name} isAhly={true} className="w-full h-full" />
              </div>
              <span className="text-xs text-ahly-muted font-medium">{t('common.vs')}</span>
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
              {t('dashboard.matchStartsSoon')}
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-ahly-card border border-ahly-border flex items-center justify-center">
              <Clock className="w-6 h-6 text-ahly-muted/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-ahly-muted font-medium">{t('dashboard.noLiveMatches')}</p>
              <p className="text-[10px] text-ahly-muted/50 mt-1">{t('dashboard.waitingForMatch')}</p>
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
