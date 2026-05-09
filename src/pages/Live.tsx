import { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import { useLanguage } from '../context/LanguageContext';
import { getLiveMatch, getUpcomingMatches, getAllStreams } from '../services/api';
import { Match, StreamSource } from '../types';

export default function Live() {
  const { t } = useLanguage();
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedStream, setSelectedStream] = useState<StreamSource | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const [live, upcoming] = await Promise.all([getLiveMatch(), getUpcomingMatches()]);
    setLiveMatch(live);
    setNextMatch(upcoming?.[0] || null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchData]);

  function handleManualRefresh() {
    setRefreshing(true);
    fetchData();
  }

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

  function handleStreamSelect(stream: StreamSource) {
    if (stream.embedUrl) {
      setSelectedStream(stream);
    } else {
      window.open(stream.url, '_blank', 'noopener,noreferrer');
    }
  }

  const allStreams = getAllStreams();
  const officialStreams = allStreams.filter((s) => s.type === 'official');
  const freeStreams = allStreams.filter((s) => s.type === 'free');
  const premiumStreams = allStreams.filter((s) => s.type === 'premium');

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tv className="w-7 h-7 text-ahly-red" />
<h1 className="page-header mb-0">{t('live.liveStreaming')}</h1>
          </div>
        </div>
        <div className="skeleton h-48 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tv className="w-7 h-7 text-ahly-red" />
          <h1 className="page-header mb-0">Live & Streaming</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-ahly-card text-ahly-muted border border-ahly-border'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('live.auto')}
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ahly-card text-ahly-muted hover:text-white border border-ahly-border transition-all text-xs font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {t('live.refresh')}
          </button>
        </div>
      </div>

      {liveMatch ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-lg font-bold text-red-400 animate-glow-red">{t('live.matchInProgress')}</h2>
          </div>
          <div className="max-w-xl">
            <MatchCard match={liveMatch} />
          </div>
        </div>
      ) : nextMatch ? (
        <div className="ahly-gradient-subtle border border-ahly-red/20 rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 opacity-[0.04]">
            <img src={`${import.meta.env.BASE_URL}ahly-logo.png`} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-ahly-muted" />
              <span className="text-sm text-ahly-muted">{t('live.noLiveMatch')}</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-4">
              {t('live.nextMatch')}: {nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}
            </h2>
            <div className="max-w-xl">
              <MatchCard match={nextMatch} compact />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card-elevated p-8 text-center mb-6">
          <WifiOff className="w-12 h-12 text-ahly-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">{t('live.noUpcoming')}</h2>
          <p className="text-sm text-ahly-muted">{t('live.checkBack')}</p>
        </div>
      )}

      {selectedStream && (
        <div
          ref={playerRef}
          className={`glass-card-elevated mb-6 border-ahly-red/30 overflow-hidden ${
            isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-none' : ''
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-ahly-dark/90 border-b border-ahly-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <Play className="w-4 h-4 text-ahly-red" />
              </div>
              <span className="text-sm font-semibold text-white">{selectedStream.name}</span>
              <span className="badge bg-green-500/20 text-green-400 text-[10px]">{selectedStream.quality}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-md hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={closePlayer}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-ahly-muted hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`relative bg-black ${isFullscreen ? 'h-[calc(100vh-48px)]' : 'aspect-video'}`}>
            <iframe
              key={selectedStream.embedUrl || selectedStream.url}
              src={selectedStream.embedUrl || selectedStream.url}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
              allowFullScreen
              referrerPolicy="no-referrer"
              title={`Stream - ${selectedStream.name}`}
            />
          </div>

          <div className="px-4 py-2 bg-ahly-dark/90 border-t border-ahly-border flex items-center justify-between">
            <span className="text-xs text-ahly-muted">
              {selectedStream.embedUrl ? 'YouTube Embed' : 'Embedded Stream'} - {selectedStream.language}
            </span>
            <a
              href={selectedStream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-ahly-red hover:text-ahly-gold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {t('live.openNewTab')}
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-fade">
        <StreamSection
          title={t('live.officialChannels')}
          icon={<Star className="w-4 h-4 text-ahly-gold" />}
          streams={officialStreams}
          selected={selectedStream}
          onSelect={handleStreamSelect}
          badge={t('live.official')}
          badgeClass="bg-ahly-gold/20 text-ahly-gold"
        />
        <StreamSection
          title={t('live.freeStreams')}
          icon={<Zap className="w-4 h-4 text-green-400" />}
          streams={freeStreams}
          selected={selectedStream}
          onSelect={handleStreamSelect}
          badge={t('live.free')}
          badgeClass="bg-green-500/20 text-green-400"
        />
        <StreamSection
          title={t('live.premium')}
          icon={<Wifi className="w-4 h-4 text-purple-400" />}
          streams={premiumStreams}
          selected={selectedStream}
          onSelect={handleStreamSelect}
          badge={t('live.premium')}
          badgeClass="bg-purple-500/20 text-purple-400"
        />
      </div>

      <div className="mt-8 glass-card-elevated p-5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-ahly-red" />
          <h3 className="text-sm font-semibold text-white">{t('live.howToWatch')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-ahly-muted">
          <div>
            <h4 className="text-white font-medium mb-1">{t('live.inEgypt')}</h4>
            <ul className="space-y-1">
              <li>- OnTime Sports (Free-to-air for Egyptian League)</li>
              <li>- beIN Sports (CAF Champions League)</li>
              <li>- TOD TV (streaming platform)</li>
              <li>- Al Ahly TV on YouTube (official)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">{t('live.freeOnline')}</h4>
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
  const { t } = useLanguage();
  return (
    <div className="glass-card-elevated p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {streams.map((stream, i) => {
          const isActive = selected?.name === stream.name;
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-ahly-red/20' : 'bg-ahly-card'}`}>
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
                  </p>
                </div>
              </div>
              <span className={`badge ${isActive ? 'bg-ahly-red/20 text-ahly-red' : badgeClass}`}>
                {isActive ? t('live.playing') : badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
