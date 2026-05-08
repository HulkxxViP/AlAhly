import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Monitor,
  Search,
  RefreshCw,
  ExternalLink,
  Play,
  X,
  WifiOff,
  Clock,
  Satellite,
  Globe,
  Tv,
} from 'lucide-react';
import Hls from 'hls.js';
import { TVChannel } from '../types';
import { getChannels } from '../data/tvChannels';
import { syncChannelsFromIPTV, shouldSync } from '../services/tvService';

type CategoryTab = 'all' | 'egyptian_sports' | 'regional' | 'international';

const categoryTabs: { key: CategoryTab; label: string }[] = [
  { key: 'all', label: 'All Channels' },
  { key: 'egyptian_sports', label: 'Egyptian Sports' },
  { key: 'regional', label: 'Regional' },
  { key: 'international', label: 'International' },
];

export default function LiveTv() {
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);

  const loadChannels = useCallback(() => {
    setChannels(getChannels());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadChannels();
    if (shouldSync()) {
      handleSync();
    }
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    const result = await syncChannelsFromIPTV();
    setSyncMessage(result.message);
    if (result.success) {
      loadChannels();
    }
    setTimeout(() => setSyncMessage(null), 5000);
    setSyncing(false);
  }

  function handleChannelClick(channel: TVChannel) {
    setSelectedChannel(channel);
  }

  function closePlayer() {
    setSelectedChannel(null);
  }

  const filtered = channels.filter((ch) => {
    if (activeTab !== 'all' && ch.category !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchAr = ch.nameAr?.toLowerCase().includes(q);
      return matchName || matchAr;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center gap-3 mb-6">
          <Satellite className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">Live TV Channels</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const grouped = {
    egyptian_sports: filtered.filter((c) => c.category === 'egyptian_sports'),
    regional: filtered.filter((c) => c.category === 'regional'),
    international: filtered.filter((c) => c.category === 'international'),
  };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Satellite className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">Live TV Channels</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border transition-all text-xs font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-ahly-card/80 border border-ahly-border text-sm text-ahly-muted flex items-center gap-2">
          <Clock className="w-4 h-4 text-ahly-red" />
          {syncMessage}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-ahly-red/20 text-ahly-red border border-ahly-red/40'
                : 'bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border/50 hover:border-ahly-red/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ahly-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search channels by name..."
          className="w-full bg-ahly-card/80 border border-ahly-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-ahly-muted focus:outline-none focus:border-ahly-red/50 focus:ring-1 focus:ring-ahly-red/30 transition-all"
        />
      </div>

      {activeTab === 'all' || activeTab === 'egyptian_sports' ? (
        <ChannelGroup
          title="Egyptian Sports"
          icon={<Monitor className="w-4 h-4 text-ahly-red" />}
          channels={grouped.egyptian_sports}
          onSelect={handleChannelClick}
        />
      ) : null}

      {activeTab === 'all' || activeTab === 'regional' ? (
        <ChannelGroup
          title="Regional"
          icon={<Tv className="w-4 h-4 text-ahly-gold" />}
          channels={grouped.regional}
          onSelect={handleChannelClick}
        />
      ) : null}

      {activeTab === 'all' || activeTab === 'international' ? (
        <ChannelGroup
          title="International"
          icon={<Globe className="w-4 h-4 text-blue-400" />}
          channels={grouped.international}
          onSelect={handleChannelClick}
        />
      ) : null}

      {filtered.length === 0 && (
        <div className="glass-card-elevated p-12 text-center">
          <WifiOff className="w-12 h-12 text-ahly-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No Channels Found</h2>
          <p className="text-sm text-ahly-muted">
            {searchQuery
              ? `No channels matching "${searchQuery}"`
              : 'No channels available in this category'}
          </p>
        </div>
      )}

      {selectedChannel && (
        <ChannelPlayer
          channel={selectedChannel}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}

function ChannelPlayer({ channel, onClose }: { channel: TVChannel; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    if (channel.streamUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setHasError(true);
        }
      });
    } else if (channel.streamUrl) {
      videoRef.current.src = channel.streamUrl;
      videoRef.current.play().catch(() => setHasError(true));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.streamUrl]);

  const canEmbed = channel.embedUrl || channel.streamUrl;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ahly-dark/95 border border-ahly-border rounded-2xl overflow-hidden w-full max-w-4xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ahly-border">
          <div className="flex items-center gap-3">
            {channel.logo && (
              <img
                src={channel.logo}
                alt=""
                className="w-7 h-7 object-contain rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="text-sm font-semibold text-white">{channel.name}</span>
            {channel.nameAr && (
              <span className="text-xs text-ahly-muted">{channel.nameAr}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {channel.website && (
              <a
                href={channel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
                title="Open website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-ahly-muted hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="aspect-video bg-black relative">
          {channel.embedUrl && !channel.streamUrl ? (
            <iframe
              key={channel.embedUrl}
              src={channel.embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title={channel.name}
            />
          ) : channel.streamUrl && !hasError ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <WifiOff className="w-12 h-12 text-ahly-muted mx-auto mb-3" />
                <p className="text-sm text-ahly-muted mb-2">
                  {hasError ? 'Stream unavailable at the moment' : 'No embedded stream available'}
                </p>
                <p className="text-xs text-ahly-muted mb-4">
                  {channel.embedUrl ? 'YouTube channel may be offline' : 'Try opening the channel website directly'}
                </p>
                {channel.website && (
                  <a
                    href={channel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ahly-red/20 text-ahly-red border border-ahly-red/30 hover:bg-ahly-red/30 transition-all text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Channel Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-ahly-border flex items-center justify-between text-xs text-ahly-muted">
          <span>
            {channel.embedUrl && !channel.streamUrl
              ? 'YouTube Embed'
              : channel.streamUrl && !channel.embedUrl
                ? 'HLS Stream'
                : channel.streamUrl && channel.embedUrl
                  ? 'HLS Stream + YouTube'
                  : 'External Channel'}
          </span>
          {channel.streamUrl && (
            <a
              href={channel.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-ahly-red hover:text-ahly-gold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Direct stream link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelGroup({
  title,
  icon,
  channels,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  channels: TVChannel[];
  onSelect: (ch: TVChannel) => void;
}) {
  if (channels.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="ml-auto text-xs text-ahly-muted">{channels.length} channels</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-fade">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className="glass-card-elevated p-4 flex flex-col items-center gap-3 group cursor-pointer text-left w-full"
          >
            <div className="w-16 h-16 rounded-xl bg-ahly-dark/80 border border-ahly-border/50 flex items-center justify-center p-2 group-hover:border-ahly-red/40 transition-all overflow-hidden">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-8 h-8 rounded-lg bg-ahly-card flex items-center justify-center"><svg class="w-4 h-4 text-ahly-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-ahly-card flex items-center justify-center">
                  <Tv className="w-4 h-4 text-ahly-red" />
                </div>
              )}
            </div>

            <div className="text-center min-w-0 w-full">
              <p className="text-sm font-medium text-white truncate group-hover:text-ahly-red transition-colors">
                {channel.name}
              </p>
              {channel.nameAr && (
                <p className="text-xs text-ahly-muted truncate mt-0.5">{channel.nameAr}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {channel.embedUrl || channel.streamUrl ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                  <Play className="w-2.5 h-2.5" />
                  Watch
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-ahly-card text-ahly-muted border border-ahly-border/50">
                  <ExternalLink className="w-2.5 h-2.5" />
                  External
                </span>
              )}
              {channel.streamUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">
                  HLS
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
