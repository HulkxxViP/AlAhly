import { Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrophyData {
  name: string;
  count: number;
  iconUrl: string;
  highlight?: boolean;
}

const trophies: TrophyData[] = [
  { name: 'Egyptian Premier League', count: 45, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/1gdEXizKE6pQePpWKOl2T5x0lCBsL9xY0YNzuItU.png', highlight: true },
  { name: 'Egyptian Cup', count: 39, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/rOVpuNZQlsykgwCVMwiXmNOzKjJ24sOOYFstQW7i.png', highlight: true },
  { name: 'CAF Champions League', count: 12, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/o6kFLw6ZrFAPclvm0EDMgrwD3VStXO5gNbeC0nAD.png', highlight: true },
  { name: 'Egyptian Super Cup', count: 16, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/3NfXNY1IAMWDZxmI8Wkz7DB1NRpyvGF9eiqcOXPj.png' },
  { name: 'Cairo League', count: 16, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/HBJqhs6sQu5LJLuF8gVS1KjHUa8kEPDlnjSVVNcg.png' },
  { name: 'CAF Super Cup', count: 8, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/0YBMRGNs3LnYYqKfKdFG5AaXr4Dj7SFYvXP3tUOS.png' },
  { name: 'Sultan Hussein Cup', count: 7, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/ZpTIF4fAFxkKbU9iN7v9XfhQDwzxBl1auQrQls4r.png' },
  { name: 'African Cup Winners Cup', count: 4, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/kHu1fxNsZtrH7nsyovJiLr0T4bDseXu4z5gSmDJJ.png' },
  { name: 'Arab Elite Cup', count: 4, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/hBMYOhd662n86ysUjJaXXgOsd7Xy5AvhzFRXSuaK.png' },
  { name: 'Afro-Asian Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/uEdneoU2fn49UXEhsQ23q8wgpdu26A2rRomEqXrx.png' },
  { name: 'United Arab Republic Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/DZ0kBKlhmU1JKMTmHaL4zl5VPt9xtQtyzsC7cv25.png' },
  { name: 'CAF Confederation Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/9GjsJZoqs7wdcUDaFHTy3PTvrwatMBHpipk2xl3f.png' },
  { name: 'EFA Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/WKOc7OtoawUf5TkIxoLxaam5Dp5Q1yhvS2YTlofv.png' },
  { name: 'African-Asian-Pacific Cup', count: 1, iconUrl: 'https://board.alahlyegypt.com/storage/trophies/VgxAPJQDcgd0Ez8nQrgGHa19NHR82i51QvRDgnGE.png' },
];

export default function TrophyCabinet() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-ahly-gold" />
          Trophies
        </h3>
        <Link
          to="/trophies"
          className="text-xs text-ahly-red hover:text-ahly-gold transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {trophies.map((trophy) => (
          <div
            key={trophy.name}
            className={`relative group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
              trophy.highlight
                ? 'bg-gradient-to-br from-ahly-dark via-ahly-card to-ahly-dark border border-ahly-gold/20 hover:border-ahly-gold/40'
                : 'bg-gradient-to-br from-ahly-card to-ahly-dark border border-white/5 hover:border-white/15'
            }`}
          >
            <div className="p-4 flex flex-col items-center gap-3">
              <div className={`w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                trophy.highlight ? '' : 'opacity-80'
              }`}>
                <img
                  src={trophy.iconUrl}
                  alt={trophy.name}
                  className="w-full h-full object-contain drop-shadow-lg"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-ahly-gold/30 to-ahly-red/30 flex items-center justify-center';
                      fallback.innerHTML = `<span class="text-xl font-black text-ahly-gold">${trophy.count}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>

              <div className="text-center">
                <span className="block text-2xl md:text-3xl font-black text-white tabular-nums leading-none">
                  {trophy.count}
                </span>
              </div>

              <p className={`text-[10px] leading-tight text-center font-medium line-clamp-2 ${
                trophy.highlight ? 'text-white/80' : 'text-white/50'
              }`}>
                {trophy.name}
              </p>
            </div>

            {trophy.highlight && (
              <div className="absolute inset-0 bg-gradient-to-t from-ahly-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
