import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ShirtIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { squad } from '../data/mockData';

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a0000&color=fff&size=256&bold=true&format=svg`;
}

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const;

const positionColors: Record<string, string> = {
  Goalkeeper: 'from-yellow-500/30 to-yellow-600/10',
  Defender: 'from-blue-500/30 to-blue-600/10',
  Midfielder: 'from-green-500/30 to-green-600/10',
  Forward: 'from-ahly-red/30 to-ahly-darkRed/10',
};

export default function PlayerRotation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSquad = filter === 'All'
    ? squad
    : squad.filter((p) => p.position === filter);

  const safeIndex = currentIndex >= filteredSquad.length ? 0 : currentIndex;

  const next = useCallback(() => {
    if (filteredSquad.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredSquad.length);
  }, [filteredSquad.length]);

  const prev = useCallback(() => {
    if (filteredSquad.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredSquad.length) % filteredSquad.length);
  }, [filteredSquad.length]);

  const goTo = useCallback((i: number) => {
    setCurrentIndex(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  }, []);

  useEffect(() => {
    if (isPaused || filteredSquad.length <= 1) return;
    intervalRef.current = setInterval(next, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, next, filteredSquad.length]);

  useEffect(() => {
    if (safeIndex !== currentIndex) setCurrentIndex(safeIndex);
  }, [filter]);

  const getVisiblePlayers = () => {
    const len = filteredSquad.length;
    if (len === 0) return [];
    const prev2 = (safeIndex - 2 + len) % len;
    const prev1 = (safeIndex - 1 + len) % len;
    const next1 = (safeIndex + 1) % len;
    const next2 = (safeIndex + 2) % len;
    return [prev2, prev1, safeIndex, next1, next2];
  };

  const visibleIndices = getVisiblePlayers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShirtIcon className="w-5 h-5 text-ahly-red" />
          Players
        </h3>
        <Link to="/squad" className="text-xs text-ahly-red hover:text-ahly-gold transition-colors flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter('All'); setCurrentIndex(0); }}
          className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
            filter === 'All' ? 'bg-ahly-red text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => { setFilter(pos); setCurrentIndex(0); }}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              filter === pos ? 'bg-ahly-red text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[380px] rounded-2xl overflow-hidden group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Smoky dark background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0000] via-[#1a0505] to-[#0a0000]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,10,10,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(200,16,46,0.05)_0%,transparent_50%)]" />

        {/* Ambient light glow on sides */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0000] via-[#1a0505]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0000] via-[#1a0505]/80 to-transparent z-10 pointer-events-none" />

        {/* Player carousel */}
        <div className="absolute inset-0 flex items-center justify-center">
          {filteredSquad.length > 0 && visibleIndices.map((playerIdx, position) => {
            const player = filteredSquad[playerIdx];
            if (!player) return null;
            const isCenter = playerIdx === safeIndex;
            const isAdjacent =
              playerIdx === (safeIndex - 1 + filteredSquad.length) % filteredSquad.length ||
              playerIdx === (safeIndex + 1) % filteredSquad.length;

            return (
              <div
                key={`${player.id}-${position}`}
                className={`absolute transition-all duration-700 ease-in-out ${
                  isCenter
                    ? 'z-20 scale-100 opacity-100'
                    : isAdjacent
                      ? 'z-10 scale-75 opacity-40 blur-[1px]'
                      : 'z-0 scale-50 opacity-0 pointer-events-none'
                }`}
                style={{
                  transform: isCenter
                    ? 'translateX(0) scale(1)'
                    : isAdjacent && playerIdx === (safeIndex - 1 + filteredSquad.length) % filteredSquad.length
                      ? 'translateX(-42%) scale(0.75)'
                      : isAdjacent
                        ? 'translateX(42%) scale(0.75)'
                        : 'translateX(0) scale(0.5)',
                }}
              >
                {/* Player card */}
                <div className="relative flex flex-col items-center">
                  {/* Player image */}
                  <div className={`relative ${isCenter ? 'w-52 h-60 md:w-64 md:h-72' : 'w-36 h-44 md:w-44 md:h-52'} overflow-hidden rounded-2xl`}>
                    <img
                      src={player.photo || getAvatarUrl(player.name)}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = 'true';
                          img.src = getAvatarUrl(player.name);
                        }
                      }}
                    />
                    {/* Bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Jersey number */}
                    <span className={`absolute ${isCenter ? 'top-3 left-3' : 'top-2 left-2'} font-black text-white/10 leading-none select-none ${isCenter ? 'text-7xl' : 'text-4xl'}`}>
                      {String(player.number).padStart(2, '0')}
                    </span>

                    {/* Position badge */}
                    <span className={`absolute ${isCenter ? 'top-3 right-3' : 'top-2 right-2'} px-2.5 py-1 rounded-full text-[10px] font-bold text-white/70 border border-white/10 bg-black/40 backdrop-blur-sm`}>
                      {player.position}
                    </span>
                  </div>

                  {/* Player info */}
                  <div className={`text-center mt-3 ${isCenter ? '' : 'hidden'}`}>
                    <h4 className="text-xl md:text-2xl font-bold text-ahly-gold tracking-wide" style={{textShadow: '0 0 20px rgba(212,175,55,0.3)'}}>
                      {player.name}
                    </h4>
                    <p className="text-sm text-white/60 mt-0.5 font-medium tracking-wider uppercase">
                      #{player.number} · {player.position}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredSquad.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
            No players found
          </div>
        )}

        {/* Navigation arrows */}
        {filteredSquad.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Pause button */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-sm"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {filteredSquad.slice(0, Math.min(filteredSquad.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${
                i === safeIndex ? 'w-5 h-2 bg-ahly-gold' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
