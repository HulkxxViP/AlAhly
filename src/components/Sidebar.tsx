import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Newspaper,
  Camera,
  Tv,
  Users,
  Settings,
  History,
  Satellite,
  Award,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const basePath = import.meta.env.BASE_URL;
const OFFICIAL_LOGO = 'https://alahlyegypt.com/_next/image?url=%2Flogo.png&w=320&q=75';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/matches', icon: Calendar, labelKey: 'nav.matches' },
  { to: '/standings', icon: Trophy, labelKey: 'nav.standings' },
  { to: '/trophies', icon: Award, labelKey: 'nav.trophies' },
  { to: '/history', icon: History, labelKey: 'nav.history' },
  { to: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { to: '/media', icon: Camera, labelKey: 'nav.media' },
  { to: '/live', icon: Tv, labelKey: 'nav.live' },
  { to: '/live-tv', icon: Satellite, labelKey: 'nav.liveTv' },
  { to: '/squad', icon: Users, labelKey: 'nav.squad' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-ahly-dark/95 backdrop-blur-xl border-r border-ahly-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-ahly-border/50">
            <div className="flex items-center gap-3">
              <img
                src={OFFICIAL_LOGO}
                alt="Al Ahly SC"
                className="w-12 h-12 animate-float-slow"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Al Ahly</h1>
                <p className="text-[10px] text-ahly-gold font-medium tracking-wider uppercase">النادي الأهلي</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-ahly-border/50">
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">{t('nav.settings')}</span>
            </NavLink>
          </div>

          <div className="p-4 mx-3 mb-3 ahly-gradient-subtle rounded-lg border border-ahly-red/20 text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 opacity-[0.04]">
              <img src={OFFICIAL_LOGO} alt="" className="w-full h-full object-contain" />
            </div>
            <img
              src={OFFICIAL_LOGO}
              alt="Al Ahly SC"
              className="w-16 h-16 mx-auto mb-2 opacity-80 animate-float"
            />
            <p className="text-xs text-ahly-muted">Club of the Century</p>
            <p className="text-xs text-ahly-gold mt-0.5">Est. 1907</p>
          </div>
        </div>
      </aside>
    </>
  );
}
