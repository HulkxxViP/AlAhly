import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Target, Shield, Award } from 'lucide-react';
import StandingsTable from '../components/StandingsTable';
import { getStandings, getTeamStats } from '../services/api';
import { Standing, TeamStats } from '../types';

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [s, st] = await Promise.all([getStandings(), getTeamStats()]);
      setStandings(s);
      setStats(st);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setBarsAnimated(true), 200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const ahly = standings.find((s) => s.team.isAhly);

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-ahly-gold" />
        <h1 className="page-header mb-0">Egyptian Premier League - Championship Playoffs</h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
          <div className="skeleton h-96 rounded-xl" />
        </div>
      ) : (
        <>
          {ahly && stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 stagger-fade">
              <QuickStat
                icon={<Trophy className="w-4 h-4 text-ahly-gold" />}
                label="Position"
                value={`#${ahly.position}`}
              />
              <QuickStat
                icon={<TrendingUp className="w-4 h-4 text-green-400" />}
                label="Points"
                value={String(ahly.points)}
              />
              <QuickStat
                icon={<Target className="w-4 h-4 text-ahly-red" />}
                label="Goals"
                value={`${ahly.goalsFor} / ${ahly.goalsAgainst}`}
              />
              <QuickStat
                icon={<Shield className="w-4 h-4 text-blue-400" />}
                label="Goal Diff"
                value={`+${ahly.goalDifference}`}
              />
              <QuickStat
                icon={<Award className="w-4 h-4 text-purple-400" />}
                label="Record"
                value={`${ahly.won}W ${ahly.drawn}D ${ahly.lost}L`}
              />
            </div>
          )}

          <div className="glass-card-elevated p-4 md:p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Championship Playoffs Table</h2>
              <div className="flex items-center gap-4 text-xs text-ahly-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" /> Title Contenders
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-ahly-gold" /> Top 7
                </span>
              </div>
            </div>
            <StandingsTable standings={standings} />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade">
            <div className="glass-card-elevated p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-ahly-red" />
                Top Scorers (Al Ahly)
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Wessam Abou Ali', goals: 12 },
                  { name: 'Taher Mohamed', goals: 8 },
                  { name: 'Hussein El Shahat', goals: 7 },
                  { name: 'Aliou Dieng', goals: 5 },
                  { name: 'Mohamed Sherif', goals: 4 },
                ].map((scorer, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-ahly-border/30 last:border-0 animate-slide-right"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ahly-muted w-4">{i + 1}</span>
                      <span className="text-sm text-ahly-text">{scorer.name}</span>
                    </div>
                    <span className="text-sm font-bold text-ahly-red">{scorer.goals}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card-elevated p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Season Progress
              </h3>
              <div className="space-y-4">
                {ahly && (
                  <>
                    <ProgressBar label="Points" current={ahly.points} max={ahly.played * 3} color="bg-ahly-gold" animated={barsAnimated} />
                    <ProgressBar label="Win Rate" current={ahly.won} max={ahly.played} color="bg-green-400" animated={barsAnimated} />
                    <ProgressBar label="Goals Scored" current={ahly.goalsFor} max={80} color="bg-ahly-red" animated={barsAnimated} />
                    <ProgressBar label="Clean Sheets" current={stats?.cleanSheets || 0} max={ahly.played} color="bg-blue-400" animated={barsAnimated} />
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card-elevated p-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-[10px] text-ahly-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  max,
  color,
  animated,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
  animated?: boolean;
}) {
  const pct = Math.round((current / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ahly-muted">{label}</span>
        <span className="text-xs font-medium text-white">{pct}%</span>
      </div>
      <div className="h-2.5 bg-ahly-dark rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out ${animated ? 'animate-bar-grow' : ''}`}
          style={{ width: animated ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  );
}
