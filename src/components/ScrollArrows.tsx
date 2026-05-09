import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ScrollArrows() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(direction: 'up' | 'down') {
    const viewportH = window.innerHeight;
    const target = direction === 'up'
      ? 0
      : Math.min(window.scrollY + viewportH, document.documentElement.scrollHeight - viewportH);
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <button
        onClick={() => scrollTo('up')}
        className="w-10 h-10 rounded-full bg-ahly-card border border-ahly-border/60 hover:border-ahly-red/50 text-ahly-muted hover:text-ahly-red hover:bg-ahly-red/10 flex items-center justify-center transition-all shadow-lg shadow-black/30 backdrop-blur-sm"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <button
        onClick={() => scrollTo('down')}
        className="w-10 h-10 rounded-full bg-ahly-card border border-ahly-border/60 hover:border-ahly-gold/50 text-ahly-muted hover:text-ahly-gold hover:bg-ahly-gold/10 flex items-center justify-center transition-all shadow-lg shadow-black/30 backdrop-blur-sm"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}