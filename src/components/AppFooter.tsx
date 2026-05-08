import { Link } from 'react-router-dom';
import { ChevronRight, Trophy } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="border-t border-ahly-border/50 pt-0">
      <div className="max-w-2xl mx-auto text-center pt-8 pb-5 px-4 md:px-6">
        <div className="relative mb-4">
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

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-ahly-red/15 via-ahly-red/25 to-ahly-gold/10 border border-ahly-red/30 shadow-lg shadow-ahly-red/10 group hover:border-ahly-gold/40 transition-all duration-500">
            <span className="text-[11px] font-medium text-ahly-muted/70 tracking-wide">Created with</span>
            <span className="animate-heart-pulse text-red-500 drop-shadow-[0_0_6px_rgba(200,16,46,0.6)]" style={{ fontSize: '0.85rem', lineHeight: 1 }}>❤</span>
            <span className="text-[11px] font-semibold text-ahly-muted/70 tracking-wide">By</span>
            <span className="text-sm font-extrabold bg-gradient-to-r from-ahly-gold via-yellow-300 to-ahly-red bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer-text drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">Hulk</span>
          </span>

          <Link
            to="/live"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ahly-red/10 border border-ahly-red/20 text-xs text-ahly-red hover:bg-ahly-red/20 transition-all"
          >
            <Trophy className="w-3 h-3" />
            Live Matches
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}


