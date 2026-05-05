import { useState, useEffect } from 'react';
import { Users, Filter } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import { getSquad } from '../services/api';
import { Player } from '../types';

type PositionFilter = 'all' | 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export default function Squad() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<PositionFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getSquad();
      setPlayers(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered =
    filter === 'all' ? players : players.filter((p) => p.position === filter);

  const positions: PositionFilter[] = ['all', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const positionCounts = {
    all: players.length,
    Goalkeeper: players.filter((p) => p.position === 'Goalkeeper').length,
    Defender: players.filter((p) => p.position === 'Defender').length,
    Midfielder: players.filter((p) => p.position === 'Midfielder').length,
    Forward: players.filter((p) => p.position === 'Forward').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Squad</h1>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-ahly-muted flex-shrink-0" />
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setFilter(pos)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === pos
                ? 'bg-ahly-red text-white'
                : 'bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border'
            }`}
          >
            {pos === 'all' ? 'All Players' : pos + 's'}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === pos ? 'bg-white/20' : 'bg-ahly-border'
              }`}
            >
              {positionCounts[pos]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-ahly-red/30 border-t-ahly-red rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered
            .sort((a, b) => {
              const posOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
              return posOrder.indexOf(a.position) - posOrder.indexOf(b.position) || a.number - b.number;
            })
            .map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
        </div>
      )}

      <div className="mt-8 glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Season Stats Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            label="Total Goals"
            value={String(players.reduce((s, p) => s + (p.goals || 0), 0))}
            color="text-green-400"
          />
          <StatItem
            label="Total Assists"
            value={String(players.reduce((s, p) => s + (p.assists || 0), 0))}
            color="text-blue-400"
          />
          <StatItem
            label="Squad Size"
            value={String(players.length)}
            color="text-ahly-gold"
          />
          <StatItem
            label="Avg Age"
            value={String(Math.round(players.reduce((s, p) => s + p.age, 0) / players.length))}
            color="text-purple-400"
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-ahly-muted mt-0.5">{label}</p>
    </div>
  );
}
