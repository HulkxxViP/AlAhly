import { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Play,
  Star,
  Zap,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import { getLiveMatch, getUpcomingMatches } from '../services/api';
import { streamSources } from '../data/mockData';
import { Match, StreamSource } from '../types';

export default function Live() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<StreamSource | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [live, upcoming] = await Promise.all([getLiveMatch(), getUpcomingMatches()]);
      setLiveMatch(live);
      setNextMatch(upcoming?.[0] || null);
      setLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function closePlayer() {
    setSelectedStream(null);
    if (document.fullscreenElement) document.exitFullscreen();
  }

  const hasEmbedUrl = (stream: StreamSource) => !!stream.embedUrl;

  const officialStreams = streamSources.filter((s) => s.type === 'official');
  const freeStreams = streamSources.filter((s) => s.type === 'free');
  const premiumStreams = streamSources.filter((s) => s.type === 'premium');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-ahly-red/30 border-t-ahly-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Tv className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Live & Streaming</h1>
      </div>

      {liveMatch ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="live-dot" />
            <h2 className="text-lg font-bold text-red-400">Match In Progress</h2>
          </div>
          <div className="max-w-xl">
            <MatchCard match={liveMatch} />
          </div>
        </div>
      ) : nextMatch ? (
        <div className="ahly-gradient-subtle border border-ahly-red/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-ahly-muted" />
            <span className="text-sm text-ahly-muted">No Live Match Right Now</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Next match: {nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}
          </h2>
          <div className="max-w-xl">
            <MatchCard match={nextMatch} compact />
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center mb-6">
          <WifiOff className="w-12 h-12 text-ahly-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No Upcoming Matches</h2>
          <p className="text-sm text-ahly-muted">Check back later for live match updates.</p>
        </div>
      )}

      {/* Embedded Player */}
      {selectedStream && (
        <div
          ref={playerRef}
          className={`glass-card mb-6 border-ahly-red/30 overflow-hidden ${
            isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-none' : ''
          }`}
        >
          {/* Player Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ahly-dark/90 border-b border-ahly-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <Play className="w-4 h-4 text-ahly-red" />
              </div>
              <span className="text-sm font-semibold text-white">
                {selectedStream.name}
              </span>
              <span className="badge bg-green-500/20 text-green-400 text-[10px]">
                {selectedStream.quality}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {hasEmbedUrl(selectedStream) && (
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-md hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={closePlayer}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-ahly-muted hover:text-red-400 transition-colors"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Player Content */}
          <div className={`relative bg-black ${isFullscreen ? 'h-[calc(100vh-48px)]' : 'aspect-video'}`}>
            {hasEmbedUrl(selectedStream) ? (
              <iframe
                key={selectedStream.embedUrl}
                src={selectedStream.embedUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                allowFullScreen
                referrerPolicy="no-referrer"
                title={`Stream - ${selectedStream.name}`}
              />
            ) : (
              <iframe
                key={selectedStream.url}
                src={selectedStream.url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-popups-to-escape-sandbox"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                referrerPolicy="no-referrer"
                title={`Stream - ${selectedStream.name}`}
              />
            )}
          </div>

          {/* Player Footer */}
          <div className="px-4 py-2 bg-ahly-dark/90 border-t border-ahly-border flex items-center justify-between">
            <span className="text-xs text-ahly-muted">
              {hasEmbedUrl(selectedStream)
                ? 'YouTube embed - best compatibility'
                : 'Embedded stream - if blocked, use "Open in new tab"'}
            </span>
            <a
              href={selectedStream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-ahly-red hover:text-ahly-gold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in new tab
            </a>
          </div>
        </div>
      )}

      {/* Stream Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreamSection
          title="Official Channels"
          icon={<Star className="w-4 h-4 text-ahly-gold" />}
          streams={officialStreams}
          selected={selectedStream}
          onSelect={setSelectedStream}
          badge="Official"
          badgeClass="bg-ahly-gold/20 text-ahly-gold"
        />
        <StreamSection
          title="Free Streams"
          icon={<Zap className="w-4 h-4 text-green-400" />}
          streams={freeStreams}
          selected={selectedStream}
          onSelect={setSelectedStream}
          badge="Free"
          badgeClass="bg-green-500/20 text-green-400"
        />
        <StreamSection
          title="Premium"
          icon={<Wifi className="w-4 h-4 text-purple-400" />}
          streams={premiumStreams}
          selected={selectedStream}
          onSelect={setSelectedStream}
          badge="Premium"
          badgeClass="bg-purple-500/20 text-purple-400"
        />
      </div>

      {/* How to Watch */}
      <div className="mt-8 glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-ahly-red" />
          <h3 className="text-sm font-semibold text-white">How to Watch Al Ahly Matches</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-ahly-muted">
          <div>
            <h4 className="text-white font-medium mb-1">In Egypt</h4>
            <ul className="space-y-1">
              <li>- OnTime Sports (Free-to-air for Egyptian League)</li>
              <li>- beIN Sports (CAF Champions League)</li>
              <li>- TOD TV (streaming platform)</li>
              <li>- Al Ahly TV on YouTube (official)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Free Online</h4>
            <ul className="space-y-1">
              <li>- Yalla Shoot (Arabic commentary)</li>
              <li>- Koora Live (HD streams)</li>
              <li>- Match Koora Live (multiple servers)</li>
              <li>- Koora Mobasher (live matches)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamSection({
  title,
  icon,
  streams,
  selected,
  onSelect,
  badge,
  badgeClass,
}: {
  title: string;
  icon: React.ReactNode;
  streams: StreamSource[];
  selected: StreamSource | null;
  onSelect: (s: StreamSource) => void;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {streams.map((stream, i) => {
          const isActive = selected?.name === stream.name;
          const isEmbeddable = !!stream.embedUrl;
          return (
            <button
              key={i}
              onClick={() => onSelect(stream)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                isActive
                  ? 'bg-ahly-red/15 border border-ahly-red/40'
                  : 'bg-ahly-dark/50 border border-ahly-border/50 hover:border-ahly-red/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-ahly-red/20' : 'bg-ahly-card'
                  }`}
                >
                  {isActive ? (
                    <Play className="w-4 h-4 text-ahly-red" />
                  ) : (
                    <Tv className="w-4 h-4 text-ahly-muted group-hover:text-ahly-red transition-colors" />
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${isActive ? 'text-ahly-red' : 'text-white'}`}>
                    {stream.name}
                  </p>
                  <p className="text-xs text-ahly-muted">
                    {stream.quality} - {stream.language}
                    {isEmbeddable && ' - Embeddable'}
                  </p>
                </div>
              </div>
              <span className={`badge ${isActive ? 'bg-ahly-red/20 text-ahly-red' : badgeClass}`}>
                {isActive ? 'Playing' : badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
