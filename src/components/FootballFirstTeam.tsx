import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft  } from 'lucide-react';
import { AHLY_TEAM } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import PlayerRotation from './PlayerRotation';

const OFFICIAL_LOGO = 'https://alahlyegypt.com/_next/image?url=%2Flogo.png&w=320&q=75';

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
  const { t } = useLanguage();
  const [heroIndex, setHeroIndex] = useState(0);

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
          <p className="text-xs text-ahly-muted">Al Ahly SC � {t('dashboard.latestNews')}</p>
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

      {/* Player Auto-Rotation */}
      <PlayerRotation />
    </section>
  );
}
