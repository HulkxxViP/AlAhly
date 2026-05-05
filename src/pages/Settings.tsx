import { Settings as SettingsIcon, ExternalLink } from 'lucide-react';

const basePath = import.meta.env.BASE_URL;

export default function Settings() {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-7 h-7 text-ahly-red" />
        <h1 className="page-header mb-0">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 text-center">
          <img src={`${basePath}ahly-logo.svg`} alt="Al Ahly SC" className="w-24 h-24 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-1">Al Ahly Tracker</h2>
          <p className="text-sm text-ahly-muted mb-1">Track Al Ahly SC matches, standings, news & more</p>
          <p className="text-ahly-gold text-sm mt-2 font-medium">النادي الأهلي - نادي القرن</p>
          <p className="text-xs text-ahly-muted mt-1">Club of the Century - Est. 1907</p>
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
