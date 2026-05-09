import { useState } from 'react';
import { Trophy, Award, Medal, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface TrophyData {
  name: string;
  count: number;
  iconUrl: string;
  category: 'domestic' | 'continental' | 'international' | 'defunct';
}

const trophies: TrophyData[] = [
  { name: 'Egyptian Premier League', count: 45, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/1gdEXizKE6pQePpWKOl2T5x0lCBsL9xY0YNzuItU.png', category: 'domestic' },
  { name: 'Egyptian Cup', count: 39, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/rOVpuNZQlsykgwCVMwiXmNOzKjJ24sOOYFstQW7i.png', category: 'domestic' },
  { name: 'Egyptian Super Cup', count: 16, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/3NfXNY1IAMWDZxmI8Wkz7DB1NRpyvGF9eiqcOXPj.png', category: 'domestic' },
  { name: 'Cairo League', count: 16, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/HBJqhs6sQu5LJLuF8gVS1KjHUa8kEPDlnjSVVNcg.png', category: 'defunct' },
  { name: 'Sultan Hussein Cup', count: 7, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/ZpTIF4fAFxkKbU9iN7v9XfhQDwzxBl1auQrQls4r.png', category: 'defunct' },
  { name: 'United Arab Republic Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/DZ0kBKlhmU1JKMTmHaL4zl5VPt9xtQtyzsC7cv25.png', category: 'defunct' },
  { name: 'EFA Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/WKOc7OtoawUf5TkIxoLxaam5Dp5Q1yhvS2YTlofv.png', category: 'defunct' },
  { name: 'CAF Champions League', count: 12, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/o6kFLw6ZrFAPclvm0EDMgrwD3VStXO5gNbeC0nAD.png', category: 'continental' },
  { name: 'CAF Super Cup', count: 8, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/0YBMRGNs3LnYYqKfKdFG5AaXr4Dj7SFYvXP3tUOS.png', category: 'continental' },
  { name: 'African Cup Winners Cup', count: 4, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/kHu1fxNsZtrH7nsyovJiLr0T4bDseXu4z5gSmDJJ.png', category: 'continental' },
  { name: 'CAF Confederation Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/9GjsJZoqs7wdcUDaFHTy3PTvrwatMBHpipk2xl3f.png', category: 'continental' },
  { name: 'Afro-Asian Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/uEdneoU2fn49UXEhsQ23q8wgpdu26A2rRomEqXrx.png', category: 'international' },
  { name: 'Arab Elite Cup', count: 4, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/hBMYOhd662n86ysUjJaXXgOsd7Xy5AvhzFRXSuaK.png', category: 'international' },
  { name: 'African-Asian-Pacific Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/VgxAPJQDcgd0Ez8nQrgGHa19NHR82i51QvRDgnGE.png', category: 'international' },
];

const categoryInfo = {
  domestic: { label: 'Domestic', icon: Trophy, gradient: 'from-ahly-red/20 to-ahly-darkRed/10', border: 'border-ahly-red/20' },
  continental: { label: 'Continental', icon: Medal, gradient: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
  international: { label: 'International', icon: Star, gradient: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
  defunct: { label: 'Defunct', icon: Award, gradient: 'from-gray-500/20 to-gray-600/10', border: 'border-gray-500/20' },
};

const highlightTrophies = ['Egyptian Premier League', 'CAF Champions League', 'Egyptian Cup'];

export default function Trophies() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? trophies
    : trophies.filter((t) => t.category === activeCategory);

  const totalTrophies = trophies.reduce((s, t) => s + t.count, 0);

  return (
    <div className="page-enter space-y-6">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-ahly-dark via-ahly-card to-ahly-dark border border-ahly-gold/20 p-8 md:p-12">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full text-ahly-gold">
              <polygon points="50,5 95,35 95,65 50,95 5,65 5,35" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ahly-gold/30 to-ahly-red/30 border border-ahly-gold/30 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-ahly-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Trophy Cabinet</h1>
            <p className="text-ahly-gold font-semibold text-lg mt-1">{totalTrophies} Titles</p>
            <p className="text-sm text-white/50 mt-0.5">Al Ahly Sporting Club · Est. 1907</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-ahly-red text-white shadow-lg shadow-ahly-red/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            All ({trophies.length})
          </button>
          {(Object.entries(categoryInfo) as [string, typeof categoryInfo.domestic][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeCategory === key
                  ? 'bg-ahly-red text-white shadow-lg shadow-ahly-red/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <info.icon className="w-4 h-4" />
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Domestic Titles" value={String(trophies.filter(t => t.category === 'domestic').reduce((s, t) => s + t.count, 0))} color="text-ahly-red" />
        <StatCard label="Continental Titles" value={String(trophies.filter(t => t.category === 'continental').reduce((s, t) => s + t.count, 0))} color="text-amber-400" />
        <StatCard label="International Titles" value={String(trophies.filter(t => t.category === 'international').reduce((s, t) => s + t.count, 0))} color="text-blue-400" />
        <StatCard label="Defunct Comps" value={String(trophies.filter(t => t.category === 'defunct').reduce((s, t) => s + t.count, 0))} color="text-gray-400" />
      </div>

      {/* Trophy grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-fade">
        {filtered.map((trophy, i) => {
          const info = categoryInfo[trophy.category];
          const isHighlighted = highlightTrophies.includes(trophy.name);
          return (
            <div
              key={trophy.name}
              className={`relative group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isHighlighted
                  ? 'bg-gradient-to-br from-ahly-dark via-ahly-card to-ahly-dark border-2 border-ahly-gold/30 hover:border-ahly-gold/60'
                  : `bg-gradient-to-br ${info.gradient} border ${info.border} hover:border-white/20`
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Highlight glow */}
              {isHighlighted && (
                <div className="absolute -inset-0.5 bg-gradient-to-br from-ahly-gold/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
              )}

              <div className="relative p-5 flex flex-col items-center gap-3">
                <div className={`w-16 h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  isHighlighted ? '' : 'opacity-80'
                }`}>
                  <img
                    src={trophy.iconUrl}
                    alt={trophy.name}
                    className="w-full h-full object-contain drop-shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>

                <div className="text-center">
                  <span className={`block text-3xl md:text-4xl font-black tabular-nums leading-none ${
                    isHighlighted ? 'text-ahly-gold' : 'text-white'
                  }`}>
                    {trophy.count}
                  </span>
                </div>

                <p className={`text-xs leading-tight text-center font-semibold line-clamp-2 ${
                  isHighlighted ? 'text-white/90' : 'text-white/60'
                }`}>
                  {trophy.name}
                </p>

                <span className={`text-[9px] uppercase tracking-wider font-medium ${
                  isHighlighted ? 'text-ahly-gold/60' : 'text-white/30'
                }`}>
                  {info.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gradient-to-br from-ahly-card to-ahly-dark border border-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-ahly-muted mt-1">{label}</p>
    </div>
  );
}
