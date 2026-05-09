import MatchGallery from '../components/MatchGallery';
import { Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Media() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ahly-red/20 flex items-center justify-center">
          <Camera className="w-5 h-5 text-ahly-red" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t('media.title')}</h1>
          <p className="text-sm text-ahly-muted">{t('media.subtitle')}</p>
        </div>
      </div>

      <MatchGallery />
    </div>
  );
}