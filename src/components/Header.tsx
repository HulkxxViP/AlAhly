import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X, Trophy, Calendar, Newspaper, Users, ExternalLink } from 'lucide-react';
import { recentMatches, upcomingMatches, mockNews, squad } from '../data/mockData';

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

        <div className="hidden md:flex items-center gap-1.5 text-[10px]">
          <span className="text-ahly-muted/40">Created with</span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-ahly-red/10 via-ahly-red/20 to-ahly-red/10 border border-ahly-red/20">
            <span className="animate-heart-pulse text-red-500" style={{ fontSize: '0.55rem' }}>❤</span>
            <span className="font-medium bg-gradient-to-r from-ahly-gold to-ahly-red bg-clip-text text-transparent">By</span>
            <span className="font-bold bg-gradient-to-r from-ahly-gold via-ahly-red to-ahly-gold bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer-text">Hulk</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
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
    </header>
  );
}
