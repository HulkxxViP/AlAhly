import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import News from './pages/News';
import Live from './pages/Live';
import LiveTv from './pages/LiveTv';
import Squad from './pages/Squad';
import Settings from './pages/Settings';
import HistoryPage from './pages/History';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ahly-dark bg-pattern">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="page-enter">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/live" element={<Live />} />
              <Route path="/live-tv" element={<LiveTv />} />
              <Route path="/squad" element={<Squad />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>

        <footer className="border-t border-ahly-border/50 pt-8 pb-6 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ahly-border/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-ahly-dark px-4 text-[10px] uppercase tracking-[0.3em] text-ahly-muted/50 font-light">
                  Honoring the Club of the Century
                </span>
              </div>
            </div>

            <p className="text-xs text-ahly-muted/60 mb-4 leading-relaxed">
              Al-Ahly Tracker &mdash; النادي الأهلي &mdash; Fan project for informational purposes.
              Not affiliated with Al Ahly SC.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-ahly-muted/40">Created with</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-ahly-red/10 via-ahly-red/20 to-ahly-red/10 border border-ahly-red/20">
                <span className="animate-heart-pulse text-red-500" style={{ fontSize: '0.65rem', lineHeight: 1 }}>❤</span>
                <span className="text-[11px] font-medium bg-gradient-to-r from-ahly-gold to-ahly-red bg-clip-text text-transparent">By</span>
                <span className="text-[11px] font-bold bg-gradient-to-r from-ahly-gold via-ahly-red to-ahly-gold bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer-text">Hulk</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

      <MusicPlayer />
    </div>
  );
}
