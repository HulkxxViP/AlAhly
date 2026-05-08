import { Player } from '../types';
import { Target, HandHelping, ShirtIcon } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

const positionColors: Record<string, string> = {
  Goalkeeper: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Defender: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Midfielder: 'bg-green-500/20 text-green-400 border-green-500/30',
  Forward: 'bg-ahly-red/20 text-ahly-red border-ahly-red/30',
};

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <div className="glass-card p-4 group cursor-pointer transition-all hover:border-ahly-red/40" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-ahly-card border border-ahly-border flex items-center justify-center overflow-hidden">
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
                  img.parentElement!.innerHTML = `<span class="text-lg font-bold text-ahly-red">${player.number}</span>`;
                }
              }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-ahly-red transition-colors">
              {player.name}
            </h3>
            {player.nameAr && (
              <p className="text-xs text-ahly-muted" dir="rtl">
                {player.nameAr}
              </p>
            )}
          </div>
        </div>
        <span
          className={`badge border ${positionColors[player.position] || 'bg-ahly-card text-ahly-muted border-ahly-border'}`}
        >
          {player.position}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-ahly-muted">
        <img
          src={`https://flagcdn.com/16x12/${getFlagCode(player.nationality)}.png`}
          alt={player.nationality}
          className="w-4 h-3 object-cover rounded-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span>{player.nationality}</span>
        <span className="text-ahly-border">|</span>
        <span>Age: {player.age}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-ahly-border/50">
        <div className="flex items-center gap-1.5">
          <ShirtIcon className="w-3.5 h-3.5 text-ahly-muted" />
          <div>
            <span className="text-sm font-semibold text-white">{player.appearances || 0}</span>
            <p className="text-[10px] text-ahly-muted">Apps</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-green-400" />
          <div>
            <span className="text-sm font-semibold text-white">{player.goals || 0}</span>
            <p className="text-[10px] text-ahly-muted">Goals</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <HandHelping className="w-3.5 h-3.5 text-blue-400" />
          <div>
            <span className="text-sm font-semibold text-white">{player.assists || 0}</span>
            <p className="text-[10px] text-ahly-muted">Assists</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=991b1b&color=fff&size=128&bold=true`;
}

function getFlagCode(nationality: string): string {
  const flags: Record<string, string> = {
    Egypt: 'eg',
    Tunisia: 'tn',
    Mali: 'ml',
    'South Africa': 'za',
    Morocco: 'ma',
    Nigeria: 'ng',
    Ghana: 'gh',
    Cameroon: 'cm',
    Senegal: 'sn',
    Algeria: 'dz',
  };
  return flags[nationality] || 'un';
}
