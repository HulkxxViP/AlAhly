import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import News from './pages/News';
import Live from './pages/Live';
import Squad from './pages/Squad';
import Settings from './pages/Settings';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ahly-dark bg-pattern">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/news" element={<News />} />
            <Route path="/live" element={<Live />} />
            <Route path="/squad" element={<Squad />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="border-t border-ahly-border p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-ahly-muted">
            <p>Al-Ahly Tracker - Club of the Century - النادي الأهلي</p>
            <p>Not affiliated with Al Ahly SC. Fan project for informational purposes.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
