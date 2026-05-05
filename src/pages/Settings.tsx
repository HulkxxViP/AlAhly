import { useState } from 'react';
import { Settings as SettingsIcon, Key, Database, Wifi, ExternalLink, RefreshCw } from 'lucide-react';
import { getDataMode } from '../services/api';

export default function Settings() {
  const dataMode = getDataMode();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-ahly-muted" />
            Data Source
          </h2>

          <div
            className={`flex items-center gap-3 p-4 rounded-lg border mb-4 ${
              dataMode === 'live'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-ahly-card border-ahly-border'
            }`}
          >
            {dataMode === 'live' ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <Database className="w-5 h-5 text-ahly-muted" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {dataMode === 'live' ? 'Live Data Active' : 'Demo Mode'}
              </p>
              <p className="text-xs text-ahly-muted">
                {dataMode === 'live'
                  ? 'Connected to API-Football for real-time data'
                  : 'Using sample data. Add an API key for live updates.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-ahly-muted flex items-center gap-2 mb-2">
                <Key className="w-4 h-4" />
                API-Football Key
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setSaved(false);
                }}
                placeholder="Enter your API key..."
                className="w-full bg-ahly-dark border border-ahly-border rounded-lg px-4 py-2.5
                  text-sm text-white placeholder:text-ahly-muted
                  focus:outline-none focus:border-ahly-red/50 transition-colors"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}
                className="px-4 py-2 ahly-gradient rounded-lg text-white text-sm font-medium
                  hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Save & Reload
              </button>
              {saved && (
                <span className="text-xs text-green-400">
                  To use a live API key, add VITE_API_FOOTBALL_KEY to your .env file and restart the dev server.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">How to Get a Free API Key</h2>
          <ol className="space-y-3 text-sm text-ahly-muted">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-ahly-red/20 text-ahly-red flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </span>
              <span>
                Visit{' '}
                <a
                  href="https://www.api-football.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ahly-red hover:underline inline-flex items-center gap-1"
                >
                  api-football.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a free account
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-ahly-red/20 text-ahly-red flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </span>
              <span>Go to your dashboard and copy your API key</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-ahly-red/20 text-ahly-red flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </span>
              <span>
                Create a <code className="bg-ahly-dark px-1.5 py-0.5 rounded text-xs">.env</code> file
                in the project root with:
                <code className="block bg-ahly-dark px-3 py-2 rounded mt-2 text-xs text-ahly-gold">
                  VITE_API_FOOTBALL_KEY=your_key_here
                </code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-ahly-red/20 text-ahly-red flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </span>
              <span>Restart the dev server to activate live data</span>
            </li>
          </ol>
          <p className="text-xs text-ahly-muted mt-4 p-3 bg-ahly-dark/50 rounded-lg">
            The free tier provides 100 requests/day — more than enough for personal use.
            Data is cached for 10 minutes to minimize API calls.
          </p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-3">About</h2>
          <div className="text-sm text-ahly-muted space-y-2">
            <p>Al-Ahly Tracker v1.0.0</p>
            <p>
              Track Al Ahly SC matches, standings, news, and more.
            </p>
            <p className="text-ahly-gold text-xs mt-2">
              النادي الأهلي - نادي القرن
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
