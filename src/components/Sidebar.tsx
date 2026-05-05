import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Newspaper,
  Tv,
  Users,
  Settings,
  Radio,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/matches', icon: Calendar, label: 'Matches' },
  { to: '/standings', icon: Trophy, label: 'Standings' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/live', icon: Tv, label: 'Live' },
  { to: '/squad', icon: Users, label: 'Squad' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-ahly-dark border-r border-ahly-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-ahly-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 ahly-gradient rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Al-Ahly</h1>
                <p className="text-xs text-ahly-muted">Tracker</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-ahly-border">
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>

          <div className="p-4 mx-3 mb-3 ahly-gradient-subtle rounded-lg border border-ahly-red/20">
            <p className="text-xs text-ahly-muted mb-1">Club of the Century</p>
            <p className="text-sm font-semibold text-white">النادي الأهلي</p>
            <p className="text-xs text-ahly-gold mt-1">Est. 1907</p>
          </div>
        </div>
      </aside>
    </>
  );
}
