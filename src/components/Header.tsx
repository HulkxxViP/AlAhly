import { Menu, Bell, Search } from 'lucide-react';

const basePath = import.meta.env.BASE_URL;

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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

          <div className="lg:hidden flex items-center gap-2">
            <img src={`${basePath}ahly-logo.png`} alt="Al Ahly" className="w-8 h-8" />
            <span className="text-sm font-bold text-white">Al Ahly Tracker</span>
          </div>

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
          <button className="relative p-2 rounded-lg hover:bg-ahly-card text-ahly-muted hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ahly-red rounded-full" />
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-ahly-red/50">
            <img src={`${basePath}ahly-logo.png`} alt="Al Ahly" className="w-full h-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
