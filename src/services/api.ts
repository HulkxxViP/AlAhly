import axios from 'axios';
import { Match, Standing, NewsItem } from '../types';
import {
  recentMatches,
  upcomingMatches,
  standings,
  mockNews,
  squad,
  teamStats,
} from '../data/mockData';

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';
const AHLY_TEAM_ID = 1026;
const EGYPTIAN_LEAGUE_ID = 233;
const CURRENT_SEASON = 2025;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': API_KEY || '',
  },
});

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

async function cachedRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

function isLiveMode(): boolean {
  return !!API_KEY && API_KEY !== 'your_api_key_here';
}

export async function getRecentMatches(): Promise<Match[]> {
  if (!isLiveMode()) return recentMatches;

  return cachedRequest('recent_matches', async () => {
    try {
      const { data } = await apiClient.get('/fixtures', {
        params: {
          team: AHLY_TEAM_ID,
          last: 10,
        },
      });
      return mapApiFixtures(data.response || []);
    } catch {
      return recentMatches;
    }
  });
}

export async function getUpcomingMatches(): Promise<Match[]> {
  if (!isLiveMode()) return upcomingMatches;

  return cachedRequest('upcoming_matches', async () => {
    try {
      const { data } = await apiClient.get('/fixtures', {
        params: {
          team: AHLY_TEAM_ID,
          next: 10,
        },
      });
      return mapApiFixtures(data.response || []);
    } catch {
      return upcomingMatches;
    }
  });
}

export async function getStandings(): Promise<Standing[]> {
  if (!isLiveMode()) return standings;

  return cachedRequest('standings', async () => {
    try {
      const { data } = await apiClient.get('/standings', {
        params: {
          league: EGYPTIAN_LEAGUE_ID,
          season: CURRENT_SEASON,
        },
      });
      const leagueStandings = data.response?.[0]?.league?.standings?.[0] || [];
      return mapApiStandings(leagueStandings);
    } catch {
      return standings;
    }
  });
}

export async function getLiveMatch(): Promise<Match | null> {
  if (!isLiveMode()) return null;

  return cachedRequest('live_match', async () => {
    try {
      const { data } = await apiClient.get('/fixtures', {
        params: {
          team: AHLY_TEAM_ID,
          live: 'all',
        },
      });
      const fixtures = data.response || [];
      if (fixtures.length > 0) {
        const mapped = mapApiFixtures(fixtures);
        return mapped[0] || null;
      }
      return null;
    } catch {
      return null;
    }
  });
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(
      'https://api.rss2json.com/v1/api.json', {
        params: {
          rss_url: 'https://news.google.com/rss/search?q=Al+Ahly+Egypt+football&hl=en&gl=EG&ceid=EG:en',
          count: 12,
        },
      }
    );

    if (response.data?.items?.length > 0) {
      return response.data.items.map((item: Record<string, string>, index: number) => ({
        id: `rss-${index}`,
        title: item.title,
        description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
        url: item.link,
        imageUrl: item.enclosure || item.thumbnail || mockNews[index % mockNews.length]?.imageUrl,
        source: item.author || 'Google News',
        publishedAt: item.pubDate,
        category: 'general' as const,
      }));
    }
    return mockNews;
  } catch {
    return mockNews;
  }
}

export async function getSquad() {
  if (!isLiveMode()) return squad;

  return cachedRequest('squad', async () => {
    try {
      const { data } = await apiClient.get('/players/squads', {
        params: { team: AHLY_TEAM_ID },
      });
      const players = data.response?.[0]?.players || [];
      if (players.length > 0) {
        return players.map((p: Record<string, unknown>, i: number) => ({
          id: p.id || i,
          name: p.name,
          position: p.position,
          number: p.number || i + 1,
          nationality: '',
          age: 0,
          photo: p.photo,
        }));
      }
      return squad;
    } catch {
      return squad;
    }
  });
}

export async function getTeamStats() {
  return teamStats;
}

export function getDataMode(): 'live' | 'demo' {
  return isLiveMode() ? 'live' : 'demo';
}

function mapApiFixtures(fixtures: Record<string, unknown>[]): Match[] {
  return fixtures.map((f: Record<string, unknown>) => {
    const fixture = f.fixture as Record<string, unknown>;
    const league = f.league as Record<string, unknown>;
    const teamsData = f.teams as Record<string, Record<string, unknown>>;
    const goals = f.goals as Record<string, number | null>;
    const fixtureDate = new Date(fixture.date as string);
    const statusShort = (fixture.status as Record<string, unknown>)?.short as string;

    let status: Match['status'] = 'upcoming';
    if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'finished';
    else if (['1H', '2H', 'ET'].includes(statusShort)) status = 'live';
    else if (statusShort === 'HT') status = 'halftime';
    else if (['PST', 'CANC'].includes(statusShort)) status = 'postponed';

    return {
      id: fixture.id as number,
      homeTeam: {
        id: teamsData.home.id as number,
        name: teamsData.home.name as string,
        logo: teamsData.home.logo as string,
        isAhly: teamsData.home.id === AHLY_TEAM_ID,
      },
      awayTeam: {
        id: teamsData.away.id as number,
        name: teamsData.away.name as string,
        logo: teamsData.away.logo as string,
        isAhly: teamsData.away.id === AHLY_TEAM_ID,
      },
      homeScore: goals?.home ?? null,
      awayScore: goals?.away ?? null,
      date: fixtureDate.toISOString().split('T')[0],
      time: fixtureDate.toTimeString().slice(0, 5),
      status,
      competition: {
        id: league.id as number,
        name: league.name as string,
        logo: league.logo as string,
        type: 'league',
      },
      venue: (fixture.venue as Record<string, unknown>)?.name as string || '',
      minute: (fixture.status as Record<string, unknown>)?.elapsed as number | undefined,
    };
  });
}

function mapApiStandings(apiStandings: Record<string, unknown>[]): Standing[] {
  return apiStandings.map((s: Record<string, unknown>) => {
    const team = s.team as Record<string, unknown>;
    const all = s.all as Record<string, unknown>;
    const goalsData = all.goals as Record<string, number>;
    const formStr = (s.form as string) || '';
    const form = formStr
      .slice(-5)
      .split('')
      .filter((c) => ['W', 'D', 'L'].includes(c)) as ('W' | 'D' | 'L')[];

    return {
      position: s.rank as number,
      team: {
        id: team.id as number,
        name: team.name as string,
        logo: team.logo as string,
        isAhly: team.id === AHLY_TEAM_ID,
      },
      played: all.played as number,
      won: all.win as number,
      drawn: all.draw as number,
      lost: all.lose as number,
      goalsFor: goalsData.for,
      goalsAgainst: goalsData.against,
      goalDifference: s.goalsDiff as number,
      points: s.points as number,
      form,
    };
  });
}
