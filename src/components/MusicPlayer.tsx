import { useState, useRef, useEffect } from 'react';
import { Music, Music2, Volume2, VolumeX } from 'lucide-react';

const STORAGE_KEY = 'ahly_music_pref';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const pref = localStorage.getItem(STORAGE_KEY);
      if (pref === 'playing') setShowBanner(true);
    } catch {}
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      try { localStorage.setItem(STORAGE_KEY, 'paused'); } catch {}
    } else {
      audio.volume = 0.3;
      audio.play().then(() => {
        setPlaying(true);
        setShowBanner(false);
        try { localStorage.setItem(STORAGE_KEY, 'playing'); } catch {}
      }).catch(() => {
        setShowBanner(true);
      });
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }

  return (
    <>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}ahly_song.m4a`} loop preload="auto" />

      {showBanner && !playing && (
        <div className="fixed bottom-20 right-4 z-[200] animate-fade-in">
          <button
            onClick={togglePlay}
            className="bg-ahly-red text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-ahly-red/80 transition-all animate-glow"
          >
            <Music2 className="w-4 h-4" />
            Play Al Ahly Song
          </button>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-[200] flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-ahly-dark/90 border border-ahly-border backdrop-blur-sm flex items-center justify-center hover:border-ahly-red/40 transition-all"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-ahly-muted" /> : <Volume2 className="w-4 h-4 text-ahly-muted" />}
        </button>

        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            playing
              ? 'bg-ahly-red text-white animate-glow'
              : 'bg-ahly-dark/90 border border-ahly-border backdrop-blur-sm text-ahly-muted hover:text-white hover:border-ahly-red/40'
          }`}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Music2 className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
}