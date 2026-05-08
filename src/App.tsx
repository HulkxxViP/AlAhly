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
import Media from './pages/Media';
import HistoryPage from './pages/History';
import MusicPlayer from './components/MusicPlayer';
import AppFooter from './components/AppFooter';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-ahly-dark bg-pattern">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-4 md:p-6 lg:p-8 min-h-[60vh]">
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
                <Route path="/media" element={<Media />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>

          <AppFooter />
        </div>

        <MusicPlayer />
      </div>
    </ToastProvider>
  );
}
