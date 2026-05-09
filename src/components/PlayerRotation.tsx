import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShirtIcon, Pause, Play } from 'lucide-react';
import { squad } from '../data/mockData';

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=991b1b&color=fff&size=256&bold=true&format=svg`;
}

const positionBadgeColors: Record<string, string> = {
  Goalkeeper: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Defender: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Midfielder: 'bg-green-500/20 text-green-400 border-green-500/30',
  Forward: 'bg-ahly-red/20 text-ahly-red border-ahly-red/30',
};

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const;

export default function PlayerRotation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredSquad = filter === 'All'
    ? squad
    : squad.filter((p) => p.position === filter);

  const safeIndex = currentIndex >= filteredSquad.length ? 0 : currentIndex;
  const currentPlayer = filteredSquad[safeIndex];

  const next = useCallback(() => {
    if (filteredSquad.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredSquad.length);
  }, [filteredSquad.length]);

  const prevHandler = useCallback(() => {
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, filteredSquad.length]);

  useEffect(() => {
    if (safeIndex !== currentIndex) {
      setCurrentIndex(safeIndex);
    }
  }, [filter, safeIndex]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShirtIcon className="w-5 h-5 text-ahly-red" />
          Players
        </h3>
        <Link
          to="/players"
          className="text-xs text-ahly-red hover:text-ahly-gold transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => { setFilter('All'); setCurrentIndex(0); }}
          className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
            filter === 'All'
              ? 'bg-ahly-red text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => { setFilter(pos); setCurrentIndex(0); }}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              filter === pos
                ? 'bg-ahly-red text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      <div
        className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br from-ahly-dark via-ahly-card to-ahly-dark border border-white/5 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {filteredSquad.map((player, i) => (
          <div
            key={player.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === safeIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-6xl md:text-7xl font-black text-white/10 leading-none">
                      {String(player.number).padStart(2, '0')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${positionBadgeColors[player.position] || 'bg-ahly-card text-ahly-muted border-ahly-border'}`}
                    >
                      {player.position}
                    </span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold text-white">
                    {player.name}
                  </h4>
                  {player.nameAr && (
                    <p className="text-lg text-white/60" dir="rtl">
                      {player.nameAr}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                    <span>{player.nationality}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>Age: {player.age}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{player.appearances} Apps</span>
                  </div>
                </div>

                {player.photo && (
                  <img
                    src={player.photo}
                    alt=""
                    className="hidden md:block w-28 h-28 rounded-2xl object-cover border-2 border-white/10 shadow-2xl"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSquad.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevHandler(); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute top-3 right-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-all border border-white/10"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="absolute bottom-3 right-6 flex gap-1.5">
          {filteredSquad.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${
                i === safeIndex
                  ? 'w-6 h-2 bg-ahly-gold'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
