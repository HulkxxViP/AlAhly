import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Search, X, Trophy, Calendar, Newspaper, Users, ExternalLink, Clock, ChevronRight, Zap } from 'lucide-react';
import { recentMatches, upcomingMatches, mockNews, squad } from '../data/mockData';
import { getLiveMatch, getUpcomingMatches, getRecentMatches } from '../services/api';
import { Match, MatchEvent } from '../types';

const basePath = import.meta.env.BASE_URL;

interface HeaderProps {
  onMenuClick: () => void;
}

interface SearchResult {
  type: 'match' | 'player' | 'news';
  label: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [headerLiveMatch, setHeaderLiveMatch] = useState<Match | null>(null);
  const [headerNextMatch, setHeaderNextMatch] = useState<Match | null>(null);
  const [headerLastResult, setHeaderLastResult] = useState<Match | null>(null);
  const [headerEventIndex, setHeaderEventIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const [live, upcoming, recent] = await Promise.all([
        getLiveMatch(),
        getUpcomingMatches(),
        getRecentMatches(),
      ]);
      setHeaderLiveMatch(live);
      setHeaderNextMatch(upcoming?.[0] || null);
      if (recent.length > 0) setHeaderLastResult(recent[0]);
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!headerLiveMatch?.events || headerLiveMatch.events.length <= 1) return;
    const tick = setInterval(() => {
      setHeaderEventIndex((prev) =>
        prev >= (headerLiveMatch.events?.length ?? 1) - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(tick);
  }, [headerLiveMatch?.events?.length]);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const found: SearchResult[] = [];

    for (const match of [...recentMatches, ...upcomingMatches]) {
      if (
        match.homeTeam.name.toLowerCase().includes(lower) ||
        match.awayTeam.name.toLowerCase().includes(lower) ||
        match.competition.name.toLowerCase().includes(lower)
      ) {
        found.push({
          type: 'match',
          label: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          description: `${match.competition.name} — ${match.date}`,
          link: '/matches',
          icon: <Calendar className="w-4 h-4 text-ahly-red" />,
        });
        if (found.length >= 5) break;
      }
    }

    if (found.length < 5) {
      for (const player of squad) {
        if (
          player.name.toLowerCase().includes(lower) ||
          (player.nameAr && player.nameAr.includes(q)) ||
          player.position.toLowerCase().includes(lower)
        ) {
          found.push({
            type: 'player',
            label: player.name,
            description: `#${player.number} · ${player.position} · ${player.nationality}`,
            link: '/squad',
            icon: <Users className="w-4 h-4 text-blue-400" />,
          });
          if (found.length >= 5) break;
        }
      }
    }

    if (found.length < 5) {
      for (const item of mockNews) {
        if (
          item.title.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower)
        ) {
          found.push({
            type: 'news',
            label: item.title.slice(0, 60),
            description: item.source,
            link: '/news',
            icon: <Newspaper className="w-4 h-4 text-ahly-gold" />,
          });
          if (found.length >= 5) break;
        }
      }
    }

    setResults(found);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      navigate(results[focusedIndex].link);
      setShowResults(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  }

  function selectResult(r: SearchResult) {
    navigate(r.link);
    setShowResults(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-30 bg-ahly-dark/80 backdrop-blur-md border-b border-ahly-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <img src={`${basePath}ahly-logo.png`} alt="Al Ahly" className="w-8 h-8" />
            <span className="text-sm font-bold text-white">Al Ahly Tracker</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-ahly-card rounded-lg px-3 py-2 border border-ahly-border w-72 lg:w-80 relative">
            <Search className="w-4 h-4 text-ahly-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); setFocusedIndex(-1); }}
              onFocus={() => query && setShowResults(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search matches, players, news..."
              className="bg-transparent border-none outline-none text-sm text-ahly-text placeholder:text-ahly-muted w-full"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowResults(false); }} className="p-0.5 rounded hover:bg-ahly-cardHover text-ahly-muted hover:text-white transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {showResults && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-ahly-card border border-ahly-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                {results.length > 0 ? (
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {results.map((r, i) => (
                      <button
                        key={`${r.type}-${r.label}`}
                        onMouseEnter={() => setFocusedIndex(i)}
                        onClick={() => selectResult(r)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === focusedIndex ? 'bg-ahly-red/10' : 'hover:bg-ahly-cardHover'
                        }`}
                      >
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-ahly-dark/60 flex items-center justify-center">
                          {r.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white font-medium truncate">{r.label}</p>
                          <p className="text-xs text-ahly-muted truncate">{r.description}</p>
                        </div>
                        <span className="text-[10px] uppercase text-ahly-muted/50 tracking-wider shrink-0">{r.type}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <Search className="w-8 h-8 text-ahly-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-ahly-muted">No results found</p>
                    <p className="text-xs text-ahly-muted/50 mt-0.5">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-ahly-red/20 via-ahly-red/30 to-ahly-gold/15 border border-ahly-red/40 shadow-lg shadow-ahly-red/10 group hover:border-ahly-gold/50 hover:shadow-ahly-gold/10 transition-all duration-500">
            <span className="text-[10px] font-medium text-ahly-muted/80 tracking-wide">Created with</span>
            <span className="animate-heart-pulse text-red-500 drop-shadow-[0_0_8px_rgba(200,16,46,0.7)]" style={{ fontSize: '0.75rem', lineHeight: 1 }}>❤</span>
            <span className="text-[10px] font-semibold text-ahly-muted/80 tracking-wide">By</span>
            <span className="text-xs font-extrabold bg-gradient-to-r from-ahly-gold via-yellow-300 to-ahly-red bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer-text drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">Hulk</span>
          </span>

          <div className="md:hidden relative">
            <button
              onClick={() => { setShowMobileSearch(true); setTimeout(() => mobileInputRef.current?.focus(), 100); }}
              className="p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <button className="relative p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ahly-red rounded-full" />
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-ahly-red/50">
            <img src={`${basePath}ahly-logo.png`} alt="Al Ahly" className="w-full h-full" />
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="md:hidden border-t border-ahly-border bg-ahly-dark px-4 py-3 animate-slide-up">
          <div className="flex items-center gap-2 bg-ahly-card rounded-lg px-3 py-2 border border-ahly-border">
            <Search className="w-4 h-4 text-ahly-muted shrink-0" />
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocusedIndex(-1); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results.length > 0) { selectResult(results[0]); }
                if (e.key === 'Escape') { setShowMobileSearch(false); setQuery(''); setResults([]); }
              }}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-ahly-text placeholder:text-ahly-muted w-full"
            />
            <button onClick={() => { setShowMobileSearch(false); setQuery(''); setResults([]); }} className="p-1 rounded hover:bg-ahly-cardHover text-ahly-muted transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          {query && (
            <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
              {results.length > 0 ? results.map((r, i) => (
                <button key={`m-${r.type}-${i}`} onClick={() => { selectResult(r); setShowMobileSearch(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ahly-cardHover text-left transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-ahly-dark/60 flex items-center justify-center shrink-0">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{r.label}</p>
                    <p className="text-xs text-ahly-muted truncate">{r.description}</p>
                  </div>
                </button>
              )) : (
                <p className="text-xs text-ahly-muted text-center py-3">No results</p>
              )}
            </div>
          )}
        </div>
      )}

      <HeaderLiveBar
        liveMatch={headerLiveMatch}
        nextMatch={headerNextMatch}
        lastResult={headerLastResult}
        eventIndex={headerEventIndex}
      />
    </header>
  );
}

function HeaderLiveBar({ liveMatch, nextMatch, lastResult, eventIndex }: { liveMatch: Match | null; nextMatch: Match | null; lastResult: Match | null; eventIndex: number }) {
  const hasLive = liveMatch && liveMatch.status === 'live';
  const events = liveMatch?.events || [];
  const currentEvent = events[eventIndex];

  return (
    <div className="border-t border-ahly-border/30 bg-gradient-to-r from-ahly-dark via-ahly-card to-ahly-dark">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {hasLive ? (
          <HeaderLiveBarInner match={liveMatch!} event={currentEvent} totalEvents={events.length} eventIndex={eventIndex} />
        ) : nextMatch ? (
          <HeaderNextBar match={nextMatch} />
        ) : lastResult ? (
          <HeaderLastBar match={lastResult} />
        ) : (
          <div className="h-8" />
        )}
      </div>
    </div>
  );
}

function HeaderLiveBarInner({ match, event, totalEvents, eventIndex: _ei }: { match: Match; event?: MatchEvent; totalEvents: number; eventIndex: number }) {
  const isAhlyHome = match.homeTeam.isAhly;
  const ahlyScore = isAhlyHome ? match.homeScore : match.awayScore;
  const oppScore = isAhlyHome ? match.awayScore : match.homeScore;
  const oppTeam = isAhlyHome ? match.awayTeam.name : match.homeTeam.name;

  return (
    <div className="flex items-center gap-2 md:gap-4 py-1.5 text-[11px] overflow-hidden">
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
        {totalEvents > 1 && (
          <span className="text-[10px] text-ahly-muted/30 shrink-0 ml-auto">{_ei + 1}/{totalEvents}</span>
        )}
      </div>

      <Link to="/live" className="ml-auto shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-ahly-red/15 text-ahly-red border border-ahly-red/20 hover:bg-ahly-red/25 transition-all text-[10px] font-medium">
        Watch <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  );
}

function HeaderNextBar({ match }: { match: Match }) {
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
    <div className="flex items-center gap-2 md:gap-4 py-1.5 text-[11px] overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-3 h-3 text-ahly-gold" />
        <span className="text-ahly-gold font-bold text-[10px] tracking-wide uppercase">Next</span>
      </div>

      <span className="text-ahly-text font-semibold truncate max-w-[80px]">{match.homeTeam.name}</span>
      <span className="text-ahly-muted/40 text-[10px]">vs</span>
      <span className="text-ahly-text font-semibold truncate max-w-[80px]">{match.awayTeam.name}</span>

      <div className="hidden md:flex items-center gap-1 ml-auto shrink-0 tabular-nums text-[11px]">
        {timeLeft.d > 0 && (
          <span className="bg-ahly-card border border-ahly-border rounded px-1 py-0.5 leading-none">
            <span className="text-white font-bold">{timeLeft.d}</span><span className="text-ahly-muted text-[9px] ml-0.5">d</span>
          </span>
        )}
        <span className="bg-ahly-card border border-ahly-border rounded px-1 py-0.5 leading-none">
          <span className="text-white font-bold">{String(timeLeft.h).padStart(2, '0')}</span><span className="text-ahly-muted text-[9px] ml-0.5">h</span>
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-ahly-card border border-ahly-border rounded px-1 py-0.5 leading-none">
          <span className="text-white font-bold">{String(timeLeft.m).padStart(2, '0')}</span><span className="text-ahly-muted text-[9px] ml-0.5">m</span>
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-ahly-card border border-ahly-border rounded px-1 py-0.5 leading-none">
          <span className="text-white font-bold">{String(timeLeft.s).padStart(2, '0')}</span><span className="text-ahly-muted text-[9px] ml-0.5">s</span>
        </span>
      </div>

      <Link to="/matches" className="ml-auto md:ml-2 shrink-0 text-ahly-muted/50 hover:text-ahly-muted transition-colors text-[10px]">
        Details <ChevronRight className="w-2.5 h-2.5 inline" />
      </Link>
    </div>
  );
}

function HeaderLastBar({ match }: { match: Match }) {
  const isAhly = match.homeTeam.isAhly || match.awayTeam.isAhly;
  const ahlyWon = isAhly && (
    (match.homeTeam.isAhly && (match.homeScore ?? 0) > (match.awayScore ?? 0)) ||
    (match.awayTeam.isAhly && (match.awayScore ?? 0) > (match.homeScore ?? 0))
  );

  return (
    <div className="flex items-center gap-2 md:gap-4 py-1.5 text-[11px] overflow-hidden">
      <Trophy className={`w-3 h-3 shrink-0 ${ahlyWon ? 'text-ahly-gold' : 'text-ahly-muted'}`} />
      <span className={`font-bold text-[10px] tracking-wide uppercase shrink-0 ${ahlyWon ? 'text-green-400' : 'text-ahly-muted'}`}>
        {ahlyWon ? 'Win' : match.homeScore === match.awayScore ? 'Draw' : 'Loss'}
      </span>

      <span className="text-ahly-text font-semibold truncate max-w-[80px]">{match.homeTeam.name}</span>
      <span className="font-bold text-white bg-ahly-dark/60 px-1.5 py-0.5 rounded tabular-nums">
        {match.homeScore ?? '-'}:{match.awayScore ?? '-'}
      </span>
      <span className="text-ahly-text font-semibold truncate max-w-[80px] hidden sm:inline">{match.awayTeam.name}</span>

      <span className="hidden md:inline text-ahly-muted/40 ml-auto truncate max-w-[120px]">{match.competition.name}</span>

      <Link to="/matches" className="shrink-0 text-ahly-muted/40 hover:text-ahly-muted transition-colors text-[10px] ml-2">
        All <ChevronRight className="w-2.5 h-2.5 inline" />
      </Link>
    </div>
  );
}
