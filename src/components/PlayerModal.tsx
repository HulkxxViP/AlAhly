import { Player } from '../types';
import { X, Target, HandHelping, ShirtIcon, Calendar, Flag } from 'lucide-react';

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
}

const positionColors: Record<string, string> = {
  Goalkeeper: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Defender: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Midfielder: 'bg-green-500/20 text-green-400 border-green-500/30',
  Forward: 'bg-ahly-red/20 text-ahly-red border-ahly-red/30',
};

const positionGradients: Record<string, string> = {
  Goalkeeper: 'from-yellow-900/20 to-transparent',
  Defender: 'from-blue-900/20 to-transparent',
  Midfielder: 'from-green-900/20 to-transparent',
  Forward: 'from-red-900/20 to-transparent',
};

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=991b1b&color=fff&size=128&bold=true`;
}

export default function PlayerModal({ player, onClose }: PlayerModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-md rounded-2xl border border-ahly-border bg-ahly-dark overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${positionGradients[player.position] || 'from-ahly-card/50 to-transparent'} pointer-events-none`} />

        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-ahly-card hover:bg-ahly-cardHover text-ahly-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-ahly-card border-2 border-ahly-red/50 flex items-center justify-center mb-4 overflow-hidden">
              <img
                src={player.photo || getAvatarUrl(player.name)}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = 'true';
                    img.src = getAvatarUrl(player.name);
                  } else {
                    img.style.display = 'none';
                    img.parentElement!.innerHTML = `<span class="text-3xl font-bold text-ahly-red">${player.number}</span>`;
                  }
                }}
              />
            </div>
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            {player.nameAr && (
              <p className="text-sm text-ahly-muted" dir="rtl">{player.nameAr}</p>
            )}
            <span className={`mt-2 badge border ${positionColors[player.position] || 'bg-ahly-card text-ahly-muted border-ahly-border'}`}>
              {player.position}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="glass-card p-3 flex items-center gap-3">
              <ShirtIcon className="w-5 h-5 text-ahly-red" />
              <div>
                <p className="text-[10px] text-ahly-muted uppercase tracking-wider">Number</p>
                <p className="text-lg font-bold text-white">#{player.number}</p>
              </div>
            </div>
            <div className="glass-card p-3 flex items-center gap-3">
              <Flag className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[10px] text-ahly-muted uppercase tracking-wider">Nationality</p>
                <p className="text-sm font-bold text-white">{player.nationality}</p>
              </div>
            </div>
            <div className="glass-card p-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-[10px] text-ahly-muted uppercase tracking-wider">Age</p>
                <p className="text-lg font-bold text-white">{player.age}</p>
              </div>
            </div>
            <div className="glass-card p-3 flex items-center gap-3">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-[10px] text-ahly-muted uppercase tracking-wider">Goals</p>
                <p className="text-lg font-bold text-white">{player.goals || 0}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Season Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{player.appearances || 0}</p>
                <p className="text-xs text-ahly-muted">Appearances</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{player.goals || 0}</p>
                <p className="text-xs text-ahly-muted">Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{player.assists || 0}</p>
                <p className="text-xs text-ahly-muted">Assists</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
