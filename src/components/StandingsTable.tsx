import { Standing } from '../types';

interface StandingsTableProps {
  standings: Standing[];
  compact?: boolean;
}

export default function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  const displayStandings = compact ? standings.slice(0, 6) : standings;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-ahly-muted border-b border-ahly-border">
            <th className="text-left py-3 px-2 w-8">#</th>
            <th className="text-left py-3 px-2">Team</th>
            <th className="text-center py-3 px-2">P</th>
            {!compact && (
              <>
                <th className="text-center py-3 px-2">W</th>
                <th className="text-center py-3 px-2">D</th>
                <th className="text-center py-3 px-2">L</th>
                <th className="text-center py-3 px-2 hidden sm:table-cell">GF</th>
                <th className="text-center py-3 px-2 hidden sm:table-cell">GA</th>
              </>
            )}
            <th className="text-center py-3 px-2">GD</th>
            <th className="text-center py-3 px-2 font-bold">Pts</th>
            <th className="text-center py-3 px-2">Form</th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((row, idx) => (
            <tr
              key={row.position}
              className={`border-b border-ahly-border/30 transition-all duration-200 ${
                row.team.isAhly
                  ? 'bg-ahly-red/10 hover:bg-ahly-red/15'
                  : 'hover:bg-ahly-card/60'
              }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <td className="py-3 px-2">
                <span
                  className={`text-sm font-medium ${
                    row.position <= 2
                      ? 'text-green-400'
                      : row.position >= standings.length - 2
                      ? 'text-red-400'
                      : 'text-ahly-muted'
                  }`}
                >
                  {row.position}
                </span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <img
                    src={row.team.logo}
                    alt={row.team.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.team.name)}&background=1a1a2e&color=C8102E&size=24`;
                    }}
                  />
                  <span
                    className={`text-sm ${
                      row.team.isAhly
                        ? 'text-ahly-red font-bold'
                        : 'text-ahly-text font-medium'
                    }`}
                  >
                    {row.team.name}
                  </span>
                </div>
              </td>
              <td className="text-center py-3 px-2 text-sm text-ahly-muted">{row.played}</td>
              {!compact && (
                <>
                  <td className="text-center py-3 px-2 text-sm text-green-400">{row.won}</td>
                  <td className="text-center py-3 px-2 text-sm text-yellow-400">{row.drawn}</td>
                  <td className="text-center py-3 px-2 text-sm text-red-400">{row.lost}</td>
                  <td className="text-center py-3 px-2 text-sm text-ahly-muted hidden sm:table-cell">
                    {row.goalsFor}
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-ahly-muted hidden sm:table-cell">
                    {row.goalsAgainst}
                  </td>
                </>
              )}
              <td
                className={`text-center py-3 px-2 text-sm font-medium ${
                  row.goalDifference > 0
                    ? 'text-green-400'
                    : row.goalDifference < 0
                    ? 'text-red-400'
                    : 'text-ahly-muted'
                }`}
              >
                {row.goalDifference > 0 ? '+' : ''}
                {row.goalDifference}
              </td>
              <td className="text-center py-3 px-2">
                <span
                  className={`text-sm font-bold ${
                    row.team.isAhly ? 'text-ahly-gold' : 'text-white'
                  }`}
                >
                  {row.points}
                </span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-center gap-0.5">
                  {row.form.map((result, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold text-white
                        transition-all duration-200 hover:scale-110 ${
                        result === 'W'
                          ? 'bg-green-500'
                          : result === 'D'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
