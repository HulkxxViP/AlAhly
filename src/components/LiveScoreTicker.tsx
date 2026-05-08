import { useState, useEffect } from 'react';
import { getOtherLeagueMatches } from '../services/api';
import { LeagueMatch } from '../types';

export default function LiveScoreTicker() {
  const [matches, setMatches] = useState<LeagueMatch[]>([]);

  useEffect(() => {
    getOtherLeagueMatches().then(setMatches);
  }, []);

  if (matches.length === 0) return null;

  const hasLive = matches.some((m) => m.status === 'live');

  return (
    <div className="ticker-bar rounded-lg overflow-hidden">
      <div className="flex items-stretch">
        <div className={`flex items-center gap-2 px-3 md:px-4 py-2.5 shrink-0 ${hasLive ? 'bg-red-600/20' : 'bg-ahly-dark/40'}`}>
          {hasLive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-ahly-muted/50" />
          )}
          <span className={`text-xs font-bold uppercase tracking-wider ${hasLive ? 'text-red-400' : 'text-ahly-muted'}`}>
            {hasLive ? 'Live Now' : 'Scores'}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex ticker-scroll whitespace-nowrap py-2.5">
            <div className="flex gap-6 md:gap-8 items-center ticker-content">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <span className="text-ahly-text font-medium truncate max-w-[80px] md:max-w-[120px]">{m.homeTeam}</span>
                  <span className={`font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    m.status === 'live'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-ahly-dark/40 text-white'
                  }`}>
                    {m.homeScore ?? '-'}:{m.awayScore ?? '-'}
                  </span>
                  <span className="text-ahly-text font-medium truncate max-w-[80px] md:max-w-[120px]">{m.awayTeam}</span>
                  {m.status === 'live' && m.minute && (
                    <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                      {m.minute}&apos;
                    </span>
                  )}
                  {m.status === 'finished' && (
                    <span className="text-ahly-muted/60 text-[10px]">FT</span>
                  )}
                  <span className="text-ahly-muted/40 text-[10px] uppercase tracking-wider hidden md:inline">{m.competition}</span>
                  <span className="text-ahly-border/50">|</span>
                </div>
              ))}
              {matches.map((m) => (
                <div key={`dup-${m.id}`} className="flex items-center gap-2 text-xs">
                  <span className="text-ahly-text font-medium truncate max-w-[80px] md:max-w-[120px]">{m.homeTeam}</span>
                  <span className={`font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    m.status === 'live'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-ahly-dark/40 text-white'
                  }`}>
                    {m.homeScore ?? '-'}:{m.awayScore ?? '-'}
                  </span>
                  <span className="text-ahly-text font-medium truncate max-w-[80px] md:max-w-[120px]">{m.awayTeam}</span>
                  {m.status === 'live' && m.minute && (
                    <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                      {m.minute}&apos;
                    </span>
                  )}
                  {m.status === 'finished' && (
                    <span className="text-ahly-muted/60 text-[10px]">FT</span>
                  )}
                  <span className="text-ahly-muted/40 text-[10px] uppercase tracking-wider hidden md:inline">{m.competition}</span>
                  <span className="text-ahly-border/50">|</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .ticker-scroll {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .ticker-content {
          animation: ticker 40s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
