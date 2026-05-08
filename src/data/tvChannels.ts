import { TVChannel } from '../types';

const defaultChannels: TVChannel[] = [
  {
    id: 'ontime-sports-1',
    name: 'OnTime Sports',
    nameAr: 'أون تايم سبورت',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/1/1f/OnTime_Sports_2023_logo.png/640px-OnTime_Sports_2023_logo.png',
    website: 'https://www.youtube.com/@OnTimeSportsTV',
    category: 'egyptian_sports',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCW4ijgE2C8xR1TwmWmnrYqA',
  },
  {
    id: 'al-ahly-tv',
    name: 'Al Ahly TV',
    nameAr: 'قناة الأهلي',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Al_Ahly_SC_logo.svg/640px-Al_Ahly_SC_logo.svg.png',
    website: 'https://www.youtube.com/@AlAHLYTVCHANNEL',
    category: 'egyptian_sports',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCmeqakSoEdmxEtTnCFSbunw',
  },
  {
    id: 'mbc-masr',
    name: 'MBC Masr',
    nameAr: 'إم بي سي مصر',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/e/ee/MBC_Masr_Logo_2022.png/640px-MBC_Masr_Logo_2022.png',
    website: 'https://mbcmasr.mbc.net/',
    category: 'regional',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8',
  },
  {
    id: 'mbc-masr-2',
    name: 'MBC Masr 2',
    nameAr: 'إم بي سي مصر 2',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/e/ee/MBC_Masr_Logo_2022.png/640px-MBC_Masr_Logo_2022.png',
    website: 'https://mbcmasr.mbc.net/',
    category: 'regional',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-2/754931856515075b0aabf0e583495c68/index.m3u8',
  },
  {
    id: 'mbc-1-egypt',
    name: 'MBC 1 Egypt',
    nameAr: 'إم بي سي 1 مصر',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/7/7d/MBC1_Logo_2022.png/640px-MBC1_Logo_2022.png',
    website: 'https://mbc1.mbc.net/',
    category: 'regional',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1-na/eec141533c90dd34722c503a296dd0d8/index.m3u8',
  },
  {
    id: 'ontime-sports-2',
    name: 'OnTime Sports 2',
    nameAr: 'أون تايم سبورت 2',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/1/1f/OnTime_Sports_2023_logo.png/640px-OnTime_Sports_2023_logo.png',
    website: 'https://www.ontimesports.tv/',
    category: 'egyptian_sports',
  },
  {
    id: 'ontime-sports-3',
    name: 'OnTime Sports 3',
    nameAr: 'أون تايم سبورت 3',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/1/1f/OnTime_Sports_2023_logo.png/640px-OnTime_Sports_2023_logo.png',
    website: 'https://www.ontimesports.tv/',
    category: 'egyptian_sports',
  },
  {
    id: 'dmc',
    name: 'DMC',
    nameAr: 'دي إم سي',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/3/3a/DMC_Logo_2022.png/640px-DMC_Logo_2022.png',
    website: 'https://dmc.com.eg/',
    category: 'egyptian_sports',
  },
  {
    id: 'bein-sports',
    name: 'beIN Sports',
    nameAr: 'بي إن سبورت',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/BeIN_Sports_2024_logo.svg/640px-BeIN_Sports_2024_logo.svg.png',
    website: 'https://www.bein.com/',
    category: 'international',
  },
  {
    id: 'fifa-plus',
    name: 'FIFA+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/FIFA%2B_%282025%29.svg/640px-FIFA%2B_%282025%29.svg.png',
    website: 'https://www.fifa.com/fifaplus/',
    category: 'international',
  },
];

const TV_CHANNELS_KEY = 'ahly_tv_channels_cache';
const TV_SYNC_KEY = 'ahly_tv_channels_sync';

export function getCachedChannels(): TVChannel[] | null {
  try {
    const raw = localStorage.getItem(TV_CHANNELS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(TV_SYNC_KEY);
}

export function getDefaultChannels(): TVChannel[] {
  return defaultChannels;
}

export function updateChannelCache(channels: TVChannel[]): void {
  localStorage.setItem(TV_CHANNELS_KEY, JSON.stringify(channels));
  localStorage.setItem(TV_SYNC_KEY, new Date().toISOString());
}

export function getChannels(): TVChannel[] {
  const cached = getCachedChannels();
  return cached || defaultChannels;
}
