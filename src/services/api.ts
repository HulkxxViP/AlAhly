import axios from 'axios';
import { Match, Standing, NewsItem, StreamSource, LeagueMatch } from '../types';
import {
  recentMatches,
  upcomingMatches,
  standings,
  mockNews,
  squad,
  teamStats,
  streamSources,
  historicalMatches,
  otherLeagueMatches,
} from '../data/mockData';

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';
const AHLY_TEAM_ID = 1577;
const EGYPTIAN_LEAGUE_ID = 233;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': API_KEY || '',
  },
});

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;
const LIVE_CACHE_DURATION = 30 * 1000;
const SQUAD_CACHE_KEY = 'ahly_squad_cache';
const SQUAD_CACHE_DURATION = 30 * 60 * 1000;

async function cachedRequest<T>(key: string, fetcher: () => Promise<T>, ttl = CACHE_DURATION): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

function isLiveMode(): boolean {
  return !!API_KEY && API_KEY !== 'your_api_key_here';
}

function getSeasonForApi(): number {
  return 2025;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getRecentMatches(): Promise<Match[]> {
  if (!isLiveMode()) return recentMatches;

  return cachedRequest('recent_matches', async () => {
    try {
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data } = await apiClient.get('/fixtures', {
        params: {
          team: AHLY_TEAM_ID,
          season: getSeasonForApi(),
          from: formatDate(threeMonthsAgo),
          to: formatDate(today),
          status: 'FT-AET-PEN',
        },
      });

      const results = data.response || [];
      if (results.length > 0) {
        const mapped = mapApiFixtures(results);
        return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
      }
      return recentMatches;
    } catch {
      return recentMatches;
    }
  });
}

export async function getUpcomingMatches(): Promise<Match[]> {
  if (!isLiveMode()) return upcomingMatches;

  return cachedRequest('upcoming_matches', async () => {
    try {
      const today = new Date();
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const { data } = await apiClient.get('/fixtures', {
        params: {
          team: AHLY_TEAM_ID,
          season: getSeasonForApi(),
          from: formatDate(today),
          to: formatDate(threeMonthsLater),
          status: 'NS-TBD',
        },
      });

      const results = data.response || [];
      if (results.length > 0) {
        const mapped = mapApiFixtures(results);
        return mapped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10);
      }
      return upcomingMatches;
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
          season: getSeasonForApi(),
        },
      });

      const allStandings = data.response?.[0]?.league?.standings || [];
      // The API may return multiple groups (regular season + playoffs)
      // Use the last group which is typically the most current
      const leagueStandings = allStandings[allStandings.length - 1] || [];
      if (leagueStandings.length > 0) {
        return mapApiStandings(leagueStandings);
      }
      return standings;
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
  }, LIVE_CACHE_DURATION);
}

const NEWS_CACHE_KEY = 'ahly_news_cache';

interface RssFeed {
  url: string;
  name: string;
}

const RSS_FEEDS: RssFeed[] = [
  { url: 'https://www.kingfut.com/feed/', name: 'KingFut' },
  { url: 'https://www.filgoal.com/articles/rss', name: 'FilGoal' },
  { url: 'https://news.google.com/rss/search?q=Al+Ahly+Egypt+football+news&hl=en&gl=EG&ceid=EG:en', name: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%A3%D9%87%D9%84%D9%8A+%D9%86%D8%AA%D8%A7%D8%A6%D8%AC+%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA&hl=ar&gl=EG&ceid=EG:ar', name: 'أخبار الأهلي' },
  { url: 'https://www.goal.com/feeds/en/feeds/egypt/feed.rss', name: 'Goal Egypt' },
  { url: 'https://www.cafonline.com/rss/all-news/', name: 'CAF Online' },
];

const AHLY_KEYWORDS = [
  'al ahly', 'alahly', 'al-ahly', 'el ahly', 'ahly sc',
  'الأهلي', 'النادي الأهلي', 'القلعة الحمراء', 'نادى الأهلى',
  'red devils', 'الاهلي', 'اهلى',
];

function isAboutAlAhly(text: string): boolean {
  const lower = text.toLowerCase();
  return AHLY_KEYWORDS.some((k) => lower.includes(k));
}

function autoCategorize(title: string, description: string): NewsItem['category'] {
  const text = (title + ' ' + description).toLowerCase();
  if (/\b(goal|win|defeat|beat|victory|draw|lose|lost|match|score|result|فوز|خسارة|تعادل|هدف|مباراة)\b/.test(text)) return 'match';
  if (/\b(transfer|sign|signing|contract|deal|join|moves|sold|buy|انتقال|تعاقد|شراء|بيع|صفقة)\b/.test(text)) return 'transfer';
  if (/\b(injury|injured|torn|hamstring|knee|surgery|sidelined|fitness|return|إصابة|مصاب|جراحة|شفاء)\b/.test(text)) return 'injury';
  if (/\b(award|player of the month|best|awarded|honour|trophy|champion|جائزة|جايزة|بطولة|كأس|تتويج)\b/.test(text)) return 'award';
  return 'general';
}

function tryExtractImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure;
  if (enclosure) {
    if (typeof enclosure === 'string') return enclosure;
    if (enclosure && typeof enclosure === 'object') {
      const enc = enclosure as Record<string, unknown>;
      if (typeof enc.url === 'string') return enc.url;
      if (typeof enc.link === 'string') return enc.link;
    }
  }
  const thumb = item.thumbnail || item['media:thumbnail'] || (item as any)['media_content'];
  if (thumb) {
    if (typeof thumb === 'string') return thumb;
    if (thumb && typeof thumb === 'object') {
      const t = thumb as Record<string, unknown>;
      if (typeof t.url === 'string') return t.url;
    }
  }
  const desc = item.description as string | undefined;
  if (desc) {
    const match = desc.match(/<img[^>]+src=["']([^"']+)["']/);
    if (match && !match[1].includes('google.com')) return match[1].split('?')[0];
  }
  return undefined;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function mapRssItem(item: Record<string, unknown>, feedIndex: number, feedName: string): NewsItem | null {
  const title = (item.title as string)?.trim();
  if (!title) return null;
  const description = stripHtml((item.description as string) || '');
  return {
    id: `news-${feedIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: title,
    description: description.slice(0, 250),
    url: (item.link as string) || '',
    imageUrl: tryExtractImage(item) || undefined,
    source: (item.author as string) || feedName,
    publishedAt: (item.pubDate as string) || new Date().toISOString(),
    category: autoCategorize(title, description),
  };
}

export async function getNews(): Promise<NewsItem[]> {
  for (let i = 0; i < RSS_FEEDS.length; i++) {
    const feed = RSS_FEEDS[i];
    try {
      const response = await axios.get('https://api.rss2json.com/v1/api.json', {
        params: { rss_url: feed.url, count: 15 },
        timeout: 8000,
      });
      const items: Record<string, unknown>[] = response.data?.items || [];
      if (items.length === 0) continue;

      const mapped = items.map((item) => mapRssItem(item, i, feed.name)).filter(Boolean) as NewsItem[];
      if (mapped.length === 0) continue;

      const ahlyNews = mapped.filter((n) => isAboutAlAhly(n.title + ' ' + n.description));
      const result = ahlyNews.length >= 3 ? ahlyNews : mapped;

      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
      return result.slice(0, 24);
    } catch {
      continue;
    }
  }

  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.data) && parsed.data.length > 0) return parsed.data;
    }
  } catch {}

  return mockNews;
}

export async function getSquad() {
  if (!isLiveMode()) return squad;

  try {
    const cached = localStorage.getItem(SQUAD_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.data) && parsed.data.length > 0 && Date.now() - parsed.timestamp < SQUAD_CACHE_DURATION) {
        return parsed.data;
      }
    }
  } catch {}

  try {
    const { data } = await apiClient.get('/players/squads', {
      params: { team: AHLY_TEAM_ID },
    });
    const players = data.response?.[0]?.players || [];
    if (players.length > 0) {
      const mapped = players.map((p: Record<string, unknown>, i: number) => ({
        id: (p.id as number) || i,
        name: (p.name as string) || '',
        position: (p.position as string) || '',
        number: (p.number as number) || i + 1,
        nationality: (p.nationality as string) || '',
        age: (p.age as number) || 0,
        photo: p.photo as string | undefined,
      }));
      localStorage.setItem(SQUAD_CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
      return mapped;
    }
  } catch {}

  try {
    const cached = localStorage.getItem(SQUAD_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.data) && parsed.data.length > 0) return parsed.data;
    }
  } catch {}

  return squad;
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

    const leagueName = league.name as string;
    let compType: 'league' | 'cup' | 'continental' | 'international' = 'league';
    if (leagueName.includes('Champions') || leagueName.includes('CAF') || leagueName.includes('Super Cup')) {
      compType = 'continental';
    } else if (leagueName.includes('Cup') || leagueName.includes('كأس')) {
      compType = 'cup';
    } else if (leagueName.includes('FIFA') || leagueName.includes('World') || leagueName.includes('Intercontinental')) {
      compType = 'international';
    }

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
        name: leagueName,
        logo: league.logo as string,
        type: compType,
      },
      venue: (fixture.venue as Record<string, unknown>)?.name as string || '',
      minute: (fixture.status as Record<string, unknown>)?.elapsed as number | undefined,
    };
  });
}

const CUSTOM_STREAMS_KEY = 'ahly_custom_streams';

export function getCustomStreams(): StreamSource[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STREAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomStreams(streams: StreamSource[]): void {
  localStorage.setItem(CUSTOM_STREAMS_KEY, JSON.stringify(streams));
}

export function getAllStreams(): StreamSource[] {
  return [...streamSources, ...getCustomStreams()];
}

export async function getHistory(): Promise<Match[]> {
  return historicalMatches;
}

export async function getOtherLeagueMatches(): Promise<LeagueMatch[]> {
  return otherLeagueMatches;
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
