import { Menu, Bell, Search, Database, Wifi } from 'lucide-react';
import { getDataMode } from '../services/api';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const dataMode = getDataMode();

  return (
    <header className="sticky top-0 z-30 bg-ahly-dark/80 backdrop-blur-md border-b border-ahly-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-ahly-card rounded-lg px-3 py-2 border border-ahly-border w-80">
            <Search className="w-4 h-4 text-ahly-muted" />
            <input
              type="text"
              placeholder="Search matches, players, news..."
              className="bg-transparent border-none outline-none text-sm text-ahly-text placeholder:text-ahly-muted w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              dataMode === 'live'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-ahly-card text-ahly-muted'
            }`}
          >
            {dataMode === 'live' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <Database className="w-3 h-3" />
            )}
            {dataMode === 'live' ? 'Live Data' : 'Demo Mode'}
          </div>

          <button className="relative p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ahly-red rounded-full" />
          </button>

          <div className="w-8 h-8 ahly-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
