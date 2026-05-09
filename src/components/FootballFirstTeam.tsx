import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Clock, Calendar } from 'lucide-react';
import { mockNews, upcomingMatches, recentMatches, AHLY_TEAM } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import CountdownTimer from './CountdownTimer';

const OFFICIAL_LOGO = 'https://alahlyegypt.com/_next/image?url=%2Flogo.png&w=320&q=75';

const newsCategories = [
  { key: 'all', labelEn: 'All', labelAr: '????' },
  { key: 'Football', labelEn: 'Football', labelAr: '??? ?????' },
  { key: 'Youth Sector', labelEn: 'Youth Sector', labelAr: '???? ????????' },
  { key: 'The Club', labelEn: 'The Club', labelAr: '??????' },
  { key: 'Sports', labelEn: 'Sports', labelAr: '????????' },
];

const heroArticles = [
  {
    id: 'h1',
    imageUrl: 'https://alahly-images.s3.us-east-2.amazonaws.com/Article/original/1000378896-69fa4f27affd4.jpg',
    title: 'Al Ahly ease past Enppi 3-0 in Egyptian League to keep title hopes alive',
    description: 'Egyptian Premier League title holders Al Ahly defeated Enppi 3-0 on Tuesday in the sixth matchday of the final phase of the domestic competition.',
    category: 'Football',
  },
  {
    id: 'h2',
    imageUrl: 'https://alahly-images.s3.us-east-2.amazonaws.com/Article/original/1000379374-69fbaa2c9539c.jpg',
    title: 'Shobeir, Ashour sustain injuries during Enppi win',
    description: 'Al Ahly midfielder Emam Ashour and goalkeeper Mostafa Shobeir sustained injuries during the team\'s 3-0 win over Enppi on Tuesday.',
    category: 'Football',
  },
  {
    id: 'h3',
    imageUrl: 'https://alahly-images.s3.us-east-2.amazonaws.com/Article/original/1000376037-69f513b1c6d0d.jpg',
    title: 'Al Ahly overpower Zamalek 3-0 to complete the league double',
    description: 'Al Ahly beat Zamalek 3-0 in the fifth round of the final phase of the Egyptian Premier League at Cairo International Stadium on Friday.',
    category: 'Football',
  },
];

export default function FootballFirstTeam() {
  const { t, lang } = useLanguage();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredNews = activeCategory === 'all'
    ? mockNews
    : mockNews.filter(() => {
        const categoryMap: Record<string, string> = {
          'Football': 'match',
          'Youth Sector': 'general',
          'The Club': 'award',
          'Sports': 'general',
        };
        const mappedCategory = categoryMap[activeCategory] || 'general';
        return activeCategory === 'Football' ? true : false;
      });

  const nextHero = () => setHeroIndex((prev) => (prev + 1) % heroArticles.length);
  const prevHero = () => setHeroIndex((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);

  return (
    <section className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ahly-red to-ahly-darkRed flex items-center justify-center shadow-lg shadow-ahly-red/30">
          <img src={OFFICIAL_LOGO} alt="" className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Football First Team</h2>
          <p className="text-xs text-ahly-muted">Al Ahly SC — {t('dashboard.latestNews')}</p>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
        {heroArticles.map((article, i) => (
          <div
            key={article.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="inline-block px-3 py-1 rounded-full bg-ahly-red text-white text-xs font-bold mb-3">
                {article.category}
              </span>
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-white/80 line-clamp-2 max-w-2xl">
                {article.description}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={prevHero}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextHero}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-3 right-6 flex gap-2">
          {heroArticles.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === heroIndex ? 'bg-ahly-gold w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Matches Scroller */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ahly-red" />
            {t('dashboard.upcomingFixtures')}
          </h3>
          <Link to="/matches" className="text-xs text-ahly-red hover:text-ahly-gold transition-colors flex items-center gap-1">
            {t('dashboard.viewAll')} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {upcomingMatches.slice(0, 5).map((match) => (
            <div
              key={match.id}
              className="min-w-[220px] bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0"
            >
              <div className="bg-gradient-to-r from-ahly-red to-ahly-darkRed px-3 py-2">
                <p className="text-white text-xs font-semibold text-center">
                  {match.competition.name}
                </p>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = OFFICIAL_LOGO; }} />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{match.homeTeam.name}</span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-lg font-black text-ahly-red">vs</span>
                    <span className="text-[10px] text-gray-400">{match.time}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = OFFICIAL_LOGO; }} />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{match.awayTeam.name}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{match.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule / Results Buttons */}
      <div className="flex justify-center gap-4">
        <Link
          to="/matches"
          className="px-8 py-2.5 bg-ahly-red hover:bg-ahly-darkRed text-white text-sm font-semibold rounded transition-colors"
        >
          Matches Schedule
        </Link>
        <Link
          to="/matches?tab=results"
          className="px-8 py-2.5 bg-ahly-red hover:bg-ahly-darkRed text-white text-sm font-semibold rounded transition-colors"
        >
          Match Results
        </Link>
      </div>

      {/* News Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span role="img" aria-label="news">??</span>
            {t('news.latest')}
          </h3>
          <Link to="/news" className="text-xs text-ahly-red hover:text-ahly-gold transition-colors flex items-center gap-1">
            More <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {newsCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-ahly-red text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {lang === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.slice(0, 6).map((news) => (
            <a
              key={news.id}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="h-40 bg-gradient-to-br from-ahly-red/20 to-ahly-dark/20 relative overflow-hidden">
                {news.imageUrl ? (
                  <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={OFFICIAL_LOGO} alt="" className="w-16 h-16 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                    news.category === 'match' ? 'bg-green-600' :
                    news.category === 'award' ? 'bg-amber-600' :
                    news.category === 'injury' ? 'bg-red-600' :
                    'bg-ahly-red'
                  }`}>
                    {news.category}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">{news.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{news.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{news.source}</span>
                  <span className="text-[10px] text-gray-400">{news.publishedAt.slice(0, 10)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
