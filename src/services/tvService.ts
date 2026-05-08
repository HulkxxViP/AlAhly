import { TVChannel } from '../types';
import { getDefaultChannels, updateChannelCache, getLastSyncTime } from '../data/tvChannels';

const IPTV_API_BASE = 'https://iptv-org.github.io/api';
const SYNC_INTERVAL = 24 * 60 * 60 * 1000;

const EGYPTIAN_SPORT_CHANNEL_IDS = new Set([
  'OnTimeSports1.eg',
  'OnTimeSports2.eg',
  'OnTimeSports3.eg',
  'NileSport.eg',
  'AlAhlyTV.eg',
  'MBCMasr.eg',
  'MBCMasr2.eg',
  'MBC1Egypt.eg',
]);

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function isSportsOrRelevant(categories: string[]): boolean {
  if (!categories || categories.length === 0) return false;
  return categories.includes('sports');
}

export async function syncChannelsFromIPTV(): Promise<{
  success: boolean;
  synced: number;
  message: string;
}> {
  try {
    const [channelsData, logosData, streamsData] = await Promise.all([
      fetchJson<Record<string, unknown>[]>(`${IPTV_API_BASE}/channels.json`),
      fetchJson<Record<string, unknown>[]>(`${IPTV_API_BASE}/logos.json`),
      fetchJson<Record<string, unknown>[]>(`${IPTV_API_BASE}/streams.json`),
    ]);

    if (!channelsData) {
      return { success: false, synced: 0, message: 'Could not fetch channel data from iptv-org' };
    }

    const logoMap = new Map<string, string>();
    if (logosData) {
      for (const logo of logosData) {
        const ch = logo.channel as string;
        const url = logo.url as string;
        if (ch && url && !logoMap.has(ch)) {
          logoMap.set(ch, url);
        }
      }
    }

    const streamMap = new Map<string, { url: string; label?: string }>();
    if (streamsData) {
      for (const s of streamsData) {
        const ch = s.channel as string;
        const url = s.url as string;
        if (ch && url && !streamMap.has(ch)) {
          streamMap.set(ch, { url, label: s.label as string | undefined });
        }
      }
    }

    const egyptianSportChannels = channelsData.filter((ch) => {
      const country = ch.country as string;
      const categories = ch.categories as string[];
      return country === 'EG' && isSportsOrRelevant(categories);
    });

    const relevantInternational = channelsData.filter((ch) => {
      const id = ch.id as string;
      const categories = ch.categories as string[];
      const lower = id.toLowerCase();
      return (
        (categories?.includes('sports') || lower.includes('bein') || lower.includes('alkass')) &&
        !(ch.country === 'EG')
      );
    });

    const allRelevant = [...egyptianSportChannels, ...relevantInternational];

    const syncedChannels: TVChannel[] = [];

    for (const ch of allRelevant) {
      const id = ch.id as string;
      const channelId = `iptv-${id}`;

      if (syncedChannels.some((c) => c.id === channelId)) continue;

      const logoUrl = logoMap.get(id) || null;
      const stream = streamMap.get(id) || null;
      const website = ch.website as string | undefined;
      const categories = ch.categories as string[];
      const lowerName = (ch.name as string).toLowerCase();

      let category: TVChannel['category'] = 'international';
      if (ch.country === 'EG') {
        category = lowerName.includes('sport')
          ? 'egyptian_sports'
          : 'regional';
      } else if (
        lowerName.includes('bein') ||
        lowerName.includes('alkass') ||
        lowerName.includes('fifa+')
      ) {
        category = 'international';
      }

      syncedChannels.push({
        id: channelId,
        name: ch.name as string,
        logo: logoUrl || undefined,
        streamUrl: stream?.url || undefined,
        website: website || undefined,
        category,
        lastChecked: new Date().toISOString(),
      });
    }

    const curated = getDefaultChannels();

    const existingIds = new Set(syncedChannels.map((c) => c.id));
    const merged = [
      ...curated.filter((c) => c.id.startsWith('iptv-') ? false : !existingIds.has(c.id)),
      ...syncedChannels,
    ];

    updateChannelCache(merged);

    return {
      success: true,
      synced: syncedChannels.length,
      message: `Synced ${syncedChannels.length} channels from iptv-org`,
    };
  } catch {
    return { success: false, synced: 0, message: 'Sync failed - network error' };
  }
}

export function shouldSync(): boolean {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;
  try {
    const elapsed = Date.now() - new Date(lastSync).getTime();
    return elapsed > SYNC_INTERVAL;
  } catch {
    return true;
  }
}

export function getSyncStatus(): { lastSync: string | null; needsSync: boolean } {
  const lastSync = getLastSyncTime();
  return {
    lastSync,
    needsSync: !lastSync || Date.now() - new Date(lastSync).getTime() > SYNC_INTERVAL,
  };
}
