import loginImage from '@/assets/images/hero-pages/login.svg';
import { useTranslation } from '@dropit/i18n';

export function ImageCard() {
  const { t } = useTranslation(['auth']);

  return (
    <div className="w-full min-h-screen p-4">
      <img
        src={loginImage}
        alt={t('login.imageAlt')}
        className="w-full h-full max-h-[800px] object-contain"
      />
    </div>
  );
}
