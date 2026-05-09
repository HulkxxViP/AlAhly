import { useState, useEffect, useMemo } from 'react';
import { Users, Filter, Shield, ShieldCheck, Sword, Star, Trophy, Swords } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import PlayerModal from '../components/PlayerModal';
import { useLanguage } from '../context/LanguageContext';
import { getSquad } from '../services/api';
import { Player } from '../types';

type PositionFilter = 'all' | 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

const positionGroups: { key: PositionFilter; icon: typeof Shield; label: string; color: string }[] = [
  { key: 'all', icon: Swords, label: 'All Players', color: 'text-ahly-gold' },
  { key: 'Goalkeeper', icon: ShieldCheck, label: 'Goalkeepers', color: 'text-yellow-400' },
  { key: 'Defender', icon: Shield, label: 'Defenders', color: 'text-blue-400' },
  { key: 'Midfielder', icon: Star, label: 'Midfielders', color: 'text-green-400' },
  { key: 'Forward', icon: Sword, label: 'Forwards', color: 'text-ahly-red' },
];

export default function Squad() {
  const { t } = useLanguage();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<PositionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getSquad();
      setPlayers(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const groupedPlayers = useMemo(() => {
    const order = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const;
    const groups: Record<string, Player[]> = {};
    for (const pos of order) {
      groups[pos] = players.filter((p) => p.position === pos);
    }
    return groups;
  }, [players]);

  const filteredPlayers = useMemo(() => {
    if (filter === 'all') return players;
    return players.filter((p) => p.position === filter);
  }, [players, filter]);

  const positionCounts = useMemo(() => ({
    all: players.length,
    Goalkeeper: players.filter((p) => p.position === 'Goalkeeper').length,
    Defender: players.filter((p) => p.position === 'Defender').length,
    Midfielder: players.filter((p) => p.position === 'Midfielder').length,
    Forward: players.filter((p) => p.position === 'Forward').length,
  }), [players]);

  const squadStats = useMemo(() => ({
    totalGoals: players.reduce((s, p) => s + (p.goals || 0), 0),
    totalAssists: players.reduce((s, p) => s + (p.assists || 0), 0),
    totalApps: players.reduce((s, p) => s + (p.appearances || 0), 0),
    avgAge: Math.round(players.reduce((s, p) => s + p.age, 0) / players.length),
  }), [players]);

  const posIcons: Record<string, typeof Shield> = {
    Goalkeeper: ShieldCheck,
    Defender: Shield,
    Midfielder: Star,
    Forward: Sword,
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">{t('squad.title')}</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-ahly-card border border-ahly-border/50 overflow-hidden">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-4 skeleton rounded w-2/3" />
                <div className="h-3 skeleton rounded w-1/3" />
                <div className="h-8 skeleton rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderPlayerGrid = (playerList: Player[], startIndex = 0) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {playerList
        .sort((a, b) => {
          const posOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
          return posOrder.indexOf(a.position) - posOrder.indexOf(b.position) || a.number - b.number;
        })
        .map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={startIndex + i}
            onClick={() => setSelectedPlayer(player)}
          />
        ))}
    </div>
  );

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">{t('squad.title')}</h1>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {positionGroups.map(({ key, icon: Icon, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
              filter === key
                ? 'bg-ahly-red text-white shadow-lg shadow-ahly-red/20 scale-105'
                : 'bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border hover:border-ahly-red/30'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${filter === key ? 'text-white' : color}`} />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === key ? 'bg-white/20' : 'bg-ahly-border'
            }`}>
              {positionCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {filter === 'all' ? (
        <div className="space-y-8">
          {(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const).map((pos) => {
            const Icon = posIcons[pos];
            const posColors: Record<string, string> = {
              Goalkeeper: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
              Defender: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
              Midfielder: 'text-green-400 border-green-500/30 bg-green-500/10',
              Forward: 'text-ahly-red border-ahly-red/30 bg-ahly-red/10',
            };
            return (
              <div key={pos} className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg border ${posColors[pos]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {pos === 'Goalkeeper' ? 'Goalkeepers' : pos + 's'}
                  </h2>
                  <span className="text-xs text-ahly-muted bg-ahly-card px-2 py-0.5 rounded-full border border-ahly-border">
                    {groupedPlayers[pos]?.length || 0} players
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-ahly-border/50 to-transparent" />
                </div>
                {groupedPlayers[pos] && groupedPlayers[pos].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedPlayers[pos]
                      .sort((a, b) => a.number - b.number)
                      .map((player, i) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          index={i}
                          onClick={() => setSelectedPlayer(player)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-ahly-muted text-sm border border-dashed border-ahly-border rounded-2xl">
                    No {pos.toLowerCase()}s in current squad
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        renderPlayerGrid(filteredPlayers)
      )}

      {!loading && (
        <div className="mt-8 glass-card-elevated p-5 overflow-hidden relative animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-ahly-red/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-ahly-gold" />
              <h3 className="text-sm font-bold text-white">Squad Stats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-ahly-card/50 border border-ahly-border/30">
                <p className="text-2xl font-bold text-green-400">{squadStats.totalGoals}</p>
                <p className="text-xs text-ahly-muted mt-0.5">Total Goals</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ahly-card/50 border border-ahly-border/30">
                <p className="text-2xl font-bold text-blue-400">{squadStats.totalAssists}</p>
                <p className="text-xs text-ahly-muted mt-0.5">Total Assists</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ahly-card/50 border border-ahly-border/30">
                <p className="text-2xl font-bold text-ahly-gold">{players.length}</p>
                <p className="text-xs text-ahly-muted mt-0.5">Squad Size</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ahly-card/50 border border-ahly-border/30">
                <p className="text-2xl font-bold text-purple-400">{squadStats.avgAge}</p>
                <p className="text-xs text-ahly-muted mt-0.5">Avg Age</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
