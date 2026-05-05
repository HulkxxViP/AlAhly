import { Match } from '../types';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

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
    ? 'border-ahly-red animate-pulse-red'
    : 'border-ahly-border';

  return (
    <div className={`glass-card p-4 border ${resultClass} animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`competition-badge ${match.competition.type}`}>
          {match.competition.name}
        </span>
        {match.status === 'live' ? (
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="text-xs font-bold text-red-400">
              LIVE {match.minute ? `${match.minute}'` : ''}
            </span>
          </div>
        ) : match.status === 'finished' ? (
          <span className="text-xs text-ahly-muted">FT</span>
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
                className={`text-2xl font-bold ${
                  isAhlyHome && ahlyWon ? 'text-green-400' : 'text-white'
                }`}
              >
                {match.homeScore}
              </span>
              <span className="text-ahly-muted text-lg">-</span>
              <span
                className={`text-2xl font-bold ${
                  isAhlyAway && ahlyWon ? 'text-green-400' : 'text-white'
                }`}
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

      {!compact && match.venue && (
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
        <div className="mt-3 pt-3 border-t border-ahly-border/50 space-y-1">
          {match.events.map((event, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-ahly-muted w-8">{event.minute}'</span>
              <span>
                {event.type === 'goal' && '⚽'}
                {event.type === 'yellow' && '🟨'}
                {event.type === 'red' && '🟥'}
                {event.type === 'substitution' && '🔄'}
              </span>
              <span
                className={
                  event.team === 'home'
                    ? isAhlyHome
                      ? 'text-ahly-red'
                      : 'text-ahly-text'
                    : isAhlyAway
                    ? 'text-ahly-red'
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
      <div className={`w-12 h-12 rounded-full p-1 ${isAhly ? 'ring-2 ring-ahly-red' : ''}`}>
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
