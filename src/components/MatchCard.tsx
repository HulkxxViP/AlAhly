import { Match } from '../types';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock, Goal, Activity } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const isAhlyHome = match.homeTeam.isAhly;
  const isAhlyAway = match.awayTeam.isAhly;

  const ahlyWon =
    match.status === 'finished' &&
    ((isAhlyHome && (match.homeScore ?? 0) > (match.awayScore ?? 0)) ||
      (isAhlyAway && (match.awayScore ?? 0) > (match.homeScore ?? 0)));

  const ahlyDrew =
    match.status === 'finished' && match.homeScore === match.awayScore;

  const resultClass = ahlyWon
    ? 'border-green-500/30'
    : ahlyDrew
    ? 'border-yellow-500/30'
    : match.status === 'finished'
    ? 'border-red-500/30'
    : match.status === 'live'
    ? 'border-ahly-red'
    : 'border-ahly-border';

  return (
    <div className={`glass-card-elevated p-4 border ${resultClass} card-lift ${match.status === 'live' ? 'glow-ring-red animate-glow' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`competition-badge ${match.competition.type}`}>
          {match.competition.name}
        </span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-1.5 bg-red-500/15 px-2 py-0.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-400">
              LIVE {match.minute ? `${match.minute}'` : ''}
            </span>
          </div>
        ) : match.status === 'finished' ? (
          <span className="text-xs font-medium text-ahly-muted bg-ahly-dark/50 px-2 py-0.5 rounded">FT</span>
        ) : (
          <span className="text-xs text-ahly-muted">
            {format(parseISO(match.date), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <TeamDisplay
          name={match.homeTeam.name}
          logo={match.homeTeam.logo}
          isAhly={match.homeTeam.isAhly}
          side="home"
        />

        <div className="flex flex-col items-center min-w-[80px]">
          {match.status === 'upcoming' ? (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">{match.time}</span>
              <span className="text-xs text-ahly-muted mt-0.5">
                {format(parseISO(match.date), 'EEE, MMM d')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold tabular-nums ${
                  isAhlyHome && ahlyWon ? 'text-green-400' : isAhlyHome && match.status === 'live' ? 'text-ahly-red' : 'text-white'
                } ${match.status === 'live' ? 'animate-score-flash' : ''}`}
              >
                {match.homeScore}
              </span>
              <span className={`text-lg ${match.status === 'live' ? 'text-ahly-red font-bold animate-live-pulse' : 'text-ahly-muted'}`}>
                {match.status === 'live' ? ':' : '-'}
              </span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  isAhlyAway && ahlyWon ? 'text-green-400' : isAhlyAway && match.status === 'live' ? 'text-ahly-red' : 'text-white'
                } ${match.status === 'live' ? 'animate-score-flash' : ''}`}
              >
                {match.awayScore}
              </span>
            </div>
          )}
        </div>

        <TeamDisplay
          name={match.awayTeam.name}
          logo={match.awayTeam.logo}
          isAhly={match.awayTeam.isAhly}
          side="away"
        />
      </div>

      {match.status === 'live' && !compact && (
        <div className="mt-3 pt-3 border-t border-ahly-border/50">
          <div className="flex items-center gap-2 text-xs text-ahly-muted">
            <Activity className="w-3 h-3 text-red-400 animate-live-pulse" />
            <span>Match in progress{match.minute ? ` - ${match.minute}'` : ''}</span>
          </div>
        </div>
      )}

      {!compact && match.venue && match.status !== 'live' && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ahly-border/50">
          <div className="flex items-center gap-1 text-xs text-ahly-muted">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </div>
          {match.status === 'upcoming' && (
            <div className="flex items-center gap-1 text-xs text-ahly-muted">
              <Clock className="w-3 h-3" />
              {match.time} EET
            </div>
          )}
        </div>
      )}

      {!compact && match.events && match.events.length > 0 && (
        <div className="mt-3 pt-3 border-t border-ahly-border/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-ahly-muted mb-1.5">
            <Goal className="w-3 h-3" />
            <span className="font-medium">Match Events</span>
          </div>
          {match.events.map((event, i) => (
            <div key={i} className="flex items-center gap-2 text-xs animate-slide-right" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-ahly-muted w-8 tabular-nums">{event.minute}'</span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ahly-dark/60">
                {event.type === 'goal' && '⚽'}
                {event.type === 'yellow' && '🟨'}
                {event.type === 'red' && '🟥'}
                {event.type === 'substitution' && '🔄'}
              </span>
              <span
                className={
                  event.team === 'home'
                    ? isAhlyHome
                      ? 'text-ahly-red font-medium'
                      : 'text-ahly-text'
                    : isAhlyAway
                    ? 'text-ahly-red font-medium'
                    : 'text-ahly-text'
                }
              >
                {event.player}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamDisplay({
  name,
  logo,
  isAhly,
  side,
}: {
  name: string;
  logo: string;
  isAhly?: boolean;
  side: 'home' | 'away';
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 flex-1 ${
        side === 'away' ? 'items-end' : 'items-start'
      }`}
    >
      <div className={`w-12 h-12 rounded-full p-1 flex items-center justify-center transition-all duration-300 ${
        isAhly ? 'ring-2 ring-ahly-red glow-ring-red' : 'ring-1 ring-ahly-border'
      } ${isAhly ? 'animate-float' : ''}`}>
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=C8102E&size=48`;
          }}
        />
      </div>
      <span
        className={`text-xs font-medium text-center leading-tight ${
          isAhly ? 'text-ahly-red font-bold' : 'text-ahly-text'
        }`}
      >
        {name}
      </span>
    </div>
  );
}
