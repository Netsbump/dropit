import { createLazyFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '../shared/components/ui/button';
import { useTranslation } from '@dropit/i18n';

export const Route = createLazyFileRoute('/__auth/privacy')({
  component: Privacy,
});

function Privacy() {
  const { t } = useTranslation(['auth']);

  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('privacy.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('privacy.sections.informationWeCollect.title')}</h2>
          <p>
            {t('privacy.sections.informationWeCollect.description')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {(t('privacy.sections.informationWeCollect.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold">{t('privacy.sections.howWeUseInformation.title')}</h2>
          <p>
            {t('privacy.sections.howWeUseInformation.description')}
          </p>

          <h2 className="text-xl font-semibold">{t('privacy.sections.informationWeShare.title')}</h2>
          <p>
            {t('privacy.sections.informationWeShare.description')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {(t('privacy.sections.informationWeShare.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold">{t('privacy.sections.informationSecurity.title')}</h2>
          <p>
            {t('privacy.sections.informationSecurity.description')}
          </p>

          <h2 className="text-xl font-semibold">{t('privacy.sections.changes.title')}</h2>
          <p>
            {t('privacy.sections.changes.description')}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/login">{t('privacy.buttons.backToLogin')}</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">{t('privacy.buttons.signUp')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
