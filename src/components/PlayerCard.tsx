import { useState } from 'react';
import { Player } from '../types';
import { Target, HandHelping, ShirtIcon, ChevronDown } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  index?: number;
}

const positionConfig: Record<string, { color: string; glow: string; label: string }> = {
  Goalkeeper: { color: 'from-yellow-500 to-amber-600', glow: 'shadow-yellow-500/20', label: 'GK' },
  Defender: { color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20', label: 'DEF' },
  Midfielder: { color: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/20', label: 'MID' },
  Forward: { color: 'from-ahly-red to-red-700', glow: 'shadow-ahly-red/20', label: 'FWD' },
};

export default function PlayerCard({ player, onClick, index = 0 }: PlayerCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cfg = positionConfig[player.position] || positionConfig.Forward;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-ahly-card to-ahly-card/80 border border-ahly-border/50 hover:border-ahly-red/40 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${cfg.glow} pointer-events-none`} />

      <div className="relative z-10">
        <div className="relative h-48 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${cfg.color} opacity-20`} />
          <div className="absolute inset-0 bg-gradient-to-t from-ahly-card via-transparent to-transparent z-10" />

          {!imgError ? (
            <img
              src={player.photo}
              alt={player.name}
              className={`w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-110 group-hover:rotate-[2deg] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : null}

          {(!imgLoaded || imgError) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-ahly-red/20 flex items-center justify-center mb-2">
                  <span className="text-3xl font-black text-ahly-red">{player.number}</span>
                </div>
                <span className="text-xs text-ahly-muted">#{player.number}</span>
              </div>
            </div>
          )}

          {imgLoaded && (
            <div className="absolute bottom-3 left-3 z-20">
              <span className="text-4xl font-black text-white/80 drop-shadow-lg leading-none">
                {player.number}
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 z-20">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white border border-white/10`}>
              {cfg.label}
            </span>
          </div>

          {imgLoaded && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ahly-card to-transparent z-10" />
          )}
        </div>

        <div className="p-4 pt-3">
          <h3 className="text-sm font-bold text-white group-hover:text-ahly-red transition-colors duration-300 truncate">
            {player.name}
          </h3>
          {player.nameAr && (
            <p className="text-xs text-ahly-muted/70 truncate" dir="rtl">
              {player.nameAr}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-ahly-muted">
            <img
              src={`https://flagcdn.com/16x12/${getFlagCode(player.nationality)}.png`}
              alt={player.nationality}
              className="w-4 h-3 object-cover rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span>{player.nationality}</span>
            <span className="text-ahly-border">|</span>
            <span>{player.age} yrs</span>
          </div>

          <div className="mt-3 pt-3 border-t border-ahly-border/30 grid grid-cols-3 gap-2">
            <div className="text-center group/stat">
              <ShirtIcon className="w-3.5 h-3.5 mx-auto text-ahly-muted mb-0.5 group-hover/stat:text-ahly-red transition-colors" />
              <span className="text-sm font-bold text-white">{player.appearances || 0}</span>
              <p className="text-[9px] text-ahly-muted uppercase tracking-wider">Apps</p>
            </div>
            <div className="text-center group/stat">
              <Target className="w-3.5 h-3.5 mx-auto text-green-400 mb-0.5 group-hover/stat:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white">{player.goals || 0}</span>
              <p className="text-[9px] text-ahly-muted uppercase tracking-wider">Goals</p>
            </div>
            <div className="text-center group/stat">
              <HandHelping className="w-3.5 h-3.5 mx-auto text-blue-400 mb-0.5 group-hover/stat:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white">{player.assists || 0}</span>
              <p className="text-[9px] text-ahly-muted uppercase tracking-wider">Assists</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-ahly-red/0 group-hover:via-ahly-red/50 to-transparent transition-all duration-500" />
    </div>
  );
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
    Angola: 'ao',
    Palestine: 'ps',
  };
  return flags[nationality] || 'un';
}
