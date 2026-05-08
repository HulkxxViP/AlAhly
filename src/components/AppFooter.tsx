import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLiveMatch, getUpcomingMatches, getRecentMatches } from '../services/api';
import { Match, MatchEvent } from '../types';
import { Clock, Goal, ChevronRight, Zap, Trophy } from 'lucide-react';

export default function AppFooter() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [lastResult, setLastResult] = useState<Match | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchFooterData() {
      const [live, upcoming, recent] = await Promise.all([
        getLiveMatch(),
        getUpcomingMatches(),
        getRecentMatches(),
      ]);
      setLiveMatch(live);
      setNextMatch(upcoming?.[0] || null);
      if (recent.length > 0) setLastResult(recent[0]);
    }
    fetchFooterData();
    const interval = setInterval(fetchFooterData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!liveMatch?.events || liveMatch.events.length <= 1) return;
    tickRef.current = setInterval(() => {
      setCurrentEventIndex((prev) =>
        prev >= (liveMatch.events?.length ?? 1) - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [liveMatch?.events?.length]);

  const hasLiveData = liveMatch && liveMatch.status === 'live';
  const recentEvents = liveMatch?.events || [];
  const currentEvent = recentEvents[currentEventIndex];

  return (
    <footer className="border-t border-ahly-border/50 pt-0">
      <div className={`overflow-hidden transition-all duration-700 ease-out ${mounted ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gradient-to-r from-ahly-dark via-ahly-card to-ahly-dark border-b border-ahly-border/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {hasLiveData ? (
              <LiveBar match={liveMatch} event={currentEvent} totalEvents={recentEvents.length} />
            ) : nextMatch ? (
              <NextMatchBar match={nextMatch} />
            ) : lastResult ? (
              <LastResultBar match={lastResult} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center pt-6 pb-5 px-4 md:px-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ahly-border/30" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-ahly-dark px-4 text-[10px] uppercase tracking-[0.3em] text-ahly-muted/50 font-light">
              Honoring the Club of the Century
            </span>
          </div>
        </div>

        <p className="text-xs text-ahly-muted/60 mb-4 leading-relaxed">
          Al-Ahly Tracker &mdash; النادي الأهلي &mdash; Fan project for informational purposes.
          Not affiliated with Al Ahly SC.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-ahly-red/15 via-ahly-red/25 to-ahly-gold/10 border border-ahly-red/30 shadow-lg shadow-ahly-red/10 group hover:border-ahly-gold/40 transition-all duration-500">
            <span className="text-[11px] font-medium text-ahly-muted/70 tracking-wide">Created with</span>
            <span className="animate-heart-pulse text-red-500 drop-shadow-[0_0_6px_rgba(200,16,46,0.6)]" style={{ fontSize: '0.85rem', lineHeight: 1 }}>❤</span>
            <span className="text-[11px] font-semibold text-ahly-muted/70 tracking-wide">By</span>
            <span className="text-sm font-extrabold bg-gradient-to-r from-ahly-gold via-yellow-300 to-ahly-red bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer-text drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">Hulk</span>
          </span>

          <Link
            to="/live"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ahly-red/10 border border-ahly-red/20 text-xs text-ahly-red hover:bg-ahly-red/20 transition-all"
          >
            <Trophy className="w-3 h-3" />
            Live Matches
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function LiveBar({ match, event, totalEvents }: { match: Match; event?: MatchEvent; totalEvents: number }) {
  const isAhlyHome = match.homeTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const oppTeam = isAhlyHome ? match.awayTeam.name : match.homeTeam.name;

  function eventIcon(type: string) {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow': return '🟨';
      case 'red': return '🟥';
      case 'substitution': return '🔄';
      default: return '•';
    }
  }

  return (
    <div className="flex items-center gap-3 md:gap-5 py-2.5 text-xs overflow-hidden">
      <Link to="/live" className="flex items-center gap-2 shrink-0 group">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-sm font-bold text-red-400 tracking-wide group-hover:text-red-300 transition-colors">
          LIVE
        </span>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-ahly-text font-semibold">Al Ahly</span>
        <span className="font-bold text-white tabular-nums bg-ahly-dark/60 px-1.5 py-0.5 rounded">
          {ahlyScore ?? '-'}:{oppScore ?? '-'}
        </span>
        <span className="text-ahly-muted hidden sm:inline truncate max-w-[120px]">{oppTeam}</span>
        {match.minute && (
          <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">
            {match.minute}&apos;
          </span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2 text-ahly-muted flex-1 min-w-0 border-l border-ahly-border/30 pl-3">
        {event ? (
          <span className="animate-slide-right truncate flex items-center gap-1.5" key={`${event.minute}-${event.type}-${event.player}`}>
            <span>{eventIcon(event.type)}</span>
            <span className="tabular-nums font-medium">{event.minute}&apos;</span>
            <span className="truncate">{event.player}</span>
            <span className="text-ahly-muted/50 text-[10px]">
              {event.type === 'goal' ? 'GOAL' : event.type === 'yellow' ? 'YC' : event.type === 'red' ? 'RC' : 'SUB'}
            </span>
          </span>
        ) : (
          <span className="text-ahly-muted/50">No events yet</span>
        )}
        {totalEvents > 1 && (
          <span className="text-[10px] text-ahly-muted/40 shrink-0 ml-auto">
            {currentEventIndex + 1}/{totalEvents}
          </span>
        )}
      </div>

      <Link
        to="/live"
        className="ml-auto shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-ahly-red/15 text-ahly-red border border-ahly-red/20 hover:bg-ahly-red/25 transition-all text-[10px] font-medium"
      >
        Watch <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  );
}

function NextMatchBar({ match }: { match: Match }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
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
  }, [match.date, match.time]);

  return (
    <div className="flex items-center gap-3 md:gap-5 py-2.5 text-xs overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-ahly-gold" />
        <span className="text-ahly-gold font-bold text-[11px] tracking-wide uppercase">Next</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-ahly-text font-semibold truncate max-w-[100px]">{match.homeTeam.name}</span>
        <span className="text-ahly-muted/40 text-[10px]">vs</span>
        <span className="text-ahly-text font-semibold truncate max-w-[100px]">{match.awayTeam.name}</span>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-ahly-muted">
        <Zap className="w-3 h-3" />
        <span className="truncate max-w-[120px]">{match.venue || match.competition.name}</span>
      </div>

      <div className="flex items-center gap-1.5 ml-auto shrink-0 tabular-nums">
        {timeLeft.d > 0 && (
          <span className="bg-ahly-card border border-ahly-border rounded px-1.5 py-0.5">
            <span className="text-white font-bold">{timeLeft.d}</span>
            <span className="text-ahly-muted text-[10px] ml-0.5">d</span>
          </span>
        )}
        <span className="bg-ahly-card border border-ahly-border rounded px-1.5 py-0.5">
          <span className="text-white font-bold">{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-ahly-muted text-[10px] ml-0.5">h</span>
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-ahly-card border border-ahly-border rounded px-1.5 py-0.5">
          <span className="text-white font-bold">{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-ahly-muted text-[10px] ml-0.5">m</span>
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-ahly-card border border-ahly-border rounded px-1.5 py-0.5">
          <span className="text-white font-bold">{String(timeLeft.s).padStart(2, '0')}</span>
          <span className="text-ahly-muted text-[10px] ml-0.5">s</span>
        </span>
      </div>

      <Link
        to="/matches"
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-ahly-card border border-ahly-border hover:border-ahly-red/30 hover:text-ahly-red transition-all text-[10px] text-ahly-muted font-medium"
      >
        Details <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  );
}

function LastResultBar({ match }: { match: Match }) {
  const isAhly = match.homeTeam.isAhly || match.awayTeam.isAhly;
  const ahlyWon = isAhly && (
    (match.homeTeam.isAhly && (match.homeScore ?? 0) > (match.awayScore ?? 0)) ||
    (match.awayTeam.isAhly && (match.awayScore ?? 0) > (match.homeScore ?? 0))
  );

  return (
    <div className="flex items-center gap-3 md:gap-5 py-2.5 text-xs overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Trophy className={`w-3.5 h-3.5 ${ahlyWon ? 'text-ahly-gold' : 'text-ahly-muted'}`} />
        <span className={`font-bold text-[11px] tracking-wide uppercase ${ahlyWon ? 'text-green-400' : 'text-ahly-muted'}`}>
          {ahlyWon ? 'Win' : match.homeScore === match.awayScore ? 'Draw' : 'Loss'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-ahly-text font-semibold truncate max-w-[80px]">{match.homeTeam.name}</span>
        <span className="font-bold text-white bg-ahly-dark/60 px-1.5 py-0.5 rounded tabular-nums">
          {match.homeScore ?? '-'}:{match.awayScore ?? '-'}
        </span>
        <span className="text-ahly-text font-semibold truncate max-w-[80px] hidden sm:inline">{match.awayTeam.name}</span>
      </div>

      <span className="hidden md:inline text-ahly-muted/50 ml-2">
        {match.competition.name}
      </span>

      <Link
        to="/matches"
        className="ml-auto shrink-0 text-ahly-muted/40 hover:text-ahly-muted transition-colors"
      >
        View All <ChevronRight className="w-2.5 h-2.5 inline" />
      </Link>
    </div>
  );
}
