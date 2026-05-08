import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ExternalLink, Tv, Plus, Trash2, Code } from 'lucide-react';
import { getCustomStreams, saveCustomStreams } from '../services/api';
import { StreamSource } from '../types';

const basePath = import.meta.env.BASE_URL;

function extractEmbedUrl(input: string): string {
  const iframeSrcMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) return iframeSrcMatch[1];
  return input.trim();
}

export default function Settings() {
  const [customStreams, setCustomStreams] = useState<StreamSource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [embedInput, setEmbedInput] = useState('');
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('HD');
  const [language, setLanguage] = useState('Arabic');
  const [type, setType] = useState<'official' | 'free' | 'premium'>('free');

  useEffect(() => {
    setCustomStreams(getCustomStreams());
  }, []);

  function handleAdd() {
    if (!name.trim() || (!embedInput.trim() && !url.trim())) return;

    const embedUrl = embedInput.trim() ? extractEmbedUrl(embedInput) : undefined;

    const newStream: StreamSource = {
      name: name.trim(),
      url: url.trim() || embedUrl || '',
      embedUrl,
      quality,
      language,
      type,
    };

    const updated = [...customStreams, newStream];
    saveCustomStreams(updated);
    setCustomStreams(updated);
    setName('');
    setEmbedInput('');
    setUrl('');
    setQuality('HD');
    setLanguage('Arabic');
    setType('free');
    setShowForm(false);
  }

  function handleDelete(index: number) {
    const updated = customStreams.filter((_, i) => i !== index);
    saveCustomStreams(updated);
    setCustomStreams(updated);
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 text-center">
          <img src={`${basePath}ahly-logo.png`} alt="Al Ahly SC" className="w-24 h-24 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-1">Al Ahly Tracker</h2>
          <p className="text-sm text-ahly-muted mb-1">Track Al Ahly SC matches, standings, news & more</p>
          <p className="text-ahly-gold text-sm mt-2 font-medium">النادي الأهلي - نادي القرن</p>
          <p className="text-xs text-ahly-muted mt-1">Club of the Century - Est. 1907</p>
        </div>

        {/* Live Channels Configuration */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-ahly-red" />
              Live Channels
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-ahly-red/15 text-ahly-red hover:bg-ahly-red/25 transition-colors"
            >
              {showForm ? 'Cancel' : <><Plus className="w-3.5 h-3.5" /> Add Channel</>}
            </button>
          </div>

          {showForm && (
            <div className="mb-5 p-4 bg-ahly-dark/60 rounded-xl border border-ahly-border space-y-3">
              <div>
                <label className="block text-xs text-ahly-muted mb-1">Channel Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al Ahly TV"
                  className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-ahly-muted/50 outline-none focus:border-ahly-red/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-ahly-muted mb-1 flex items-center gap-1">
                  <Code className="w-3 h-3" /> Embed Code or Embed URL
                </label>
                <textarea
                  value={embedInput}
                  onChange={(e) => setEmbedInput(e.target.value)}
                  placeholder={'Paste iframe embed code or direct embed URL\ne.g. <iframe src="https://www.youtube.com/embed/..."></iframe>\nor https://www.youtube.com/embed/VIDEO_ID'}
                  rows={3}
                  className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-ahly-muted/50 outline-none focus:border-ahly-red/50 transition-colors font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-ahly-muted mb-1">External URL (opens in new tab if no embed)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/live"
                  className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-ahly-muted/50 outline-none focus:border-ahly-red/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-ahly-muted mb-1">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-ahly-red/50 transition-colors"
                  >
                    <option value="SD">SD</option>
                    <option value="HD">HD</option>
                    <option value="FHD">FHD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ahly-muted mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-ahly-red/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ahly-muted mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'official' | 'free' | 'premium')}
                    className="w-full bg-ahly-card border border-ahly-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-ahly-red/50 transition-colors"
                  >
                    <option value="official">Official</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!name.trim() || (!embedInput.trim() && !url.trim())}
                className="w-full py-2 rounded-lg text-sm font-semibold bg-ahly-red text-white hover:bg-ahly-red/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add Channel
              </button>
            </div>
          )}

          {customStreams.length > 0 ? (
            <div className="space-y-2">
              {customStreams.map((stream, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-ahly-dark/50 rounded-lg border border-ahly-border/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-ahly-card flex items-center justify-center flex-shrink-0">
                      <Tv className="w-4 h-4 text-ahly-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{stream.name}</p>
                      <p className="text-xs text-ahly-muted">
                        {stream.quality} · {stream.language} · <span className="capitalize">{stream.type}</span>
                        {stream.embedUrl ? ' · Embeddable' : ' · External'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-ahly-muted hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ahly-muted text-center py-4">
              No custom channels added. Click "Add Channel" to add your own stream sources.
            </p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Data Sources</h2>
          <div className="space-y-3 text-sm text-ahly-muted">
            <div className="flex items-center justify-between p-3 bg-ahly-dark/50 rounded-lg">
              <span>Match Data</span>
              <span className="text-green-400 text-xs font-medium">API-Football</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-ahly-dark/50 rounded-lg">
              <span>News Feed</span>
              <span className="text-green-400 text-xs font-medium">Google News RSS</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-ahly-dark/50 rounded-lg">
              <span>Live Streams</span>
              <span className="text-green-400 text-xs font-medium">Multiple Sources</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink label="Al Ahly Official" url="https://www.alahlyegypt.com/en" />
            <QuickLink label="Al Ahly TV YouTube" url="https://www.youtube.com/@AlAHLYTVCHANNEL" />
            <QuickLink label="Egyptian FA" url="https://www.efa.com.eg/" />
            <QuickLink label="CAF Champions League" url="https://www.cafonline.com/caf-champions-league/" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-ahly-dark/50 rounded-lg border border-ahly-border/50
        hover:border-ahly-red/30 transition-all text-sm text-ahly-text hover:text-white group"
    >
      {label}
      <ExternalLink className="w-3.5 h-3.5 text-ahly-muted group-hover:text-ahly-red transition-colors" />
    </a>
  );
}
