export interface Team {
  id: number;
  name: string;
  nameAr?: string;
  logo: string;
  isAhly?: boolean;
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  status: 'finished' | 'live' | 'upcoming' | 'halftime' | 'postponed';
  competition: Competition;
  venue?: string;
  minute?: number;
  events?: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution';
  player: string;
  team: 'home' | 'away';
}

export interface Competition {
  id: number;
  name: string;
  logo?: string;
  type: 'league' | 'cup' | 'continental' | 'international';
}

export interface Standing {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category?: 'transfer' | 'match' | 'general' | 'injury' | 'award';
}

export interface Player {
  id: number;
  name: string;
  nameAr?: string;
  position: string;
  number: number;
  nationality: string;
  age: number;
  photo?: string;
  goals?: number;
  assists?: number;
  appearances?: number;
}

export interface StreamSource {
  name: string;
  url: string;
  embedUrl?: string;
  quality: string;
  language: string;
  type: 'official' | 'free' | 'premium';
  isLive?: boolean;
}

export interface TeamStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  topScorer: { name: string; goals: number };
  topAssister: { name: string; assists: number };
}

export interface LeagueMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minute?: number;
  competition: string;
}

export interface TVChannel {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string;
  streamUrl?: string;
  embedUrl?: string;
  website?: string;
  category: 'egyptian_sports' | 'regional' | 'international' | 'free_streaming';
  isOnline?: boolean;
  lastChecked?: string;
}

export interface MatchGalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  matchId: number;
  matchTitle: string;
  date: string;
}
