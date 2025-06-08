import { createLazyFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '../shared/components/ui/button';
import { useTranslation } from '@dropit/i18n';

export const Route = createLazyFileRoute('/__auth/terms')({
  component: Terms,
});

function Terms() {
  const { t } = useTranslation(['auth']);

  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('terms.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('terms.lastUpdated')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('terms.sections.introduction.title')}</h2>
          <p>
            {t('terms.sections.introduction.description')}
          </p>

          <h2 className="text-xl font-semibold">{t('terms.sections.usingOurService.title')}</h2>
          <p>
            {t('terms.sections.usingOurService.description')}
          </p>

          <h2 className="text-xl font-semibold">{t('terms.sections.yourAccount.title')}</h2>
          <p>
            {t('terms.sections.yourAccount.description')}
          </p>

          <h2 className="text-xl font-semibold">
            {t('terms.sections.privacyAndCopyright.title')}
          </h2>
          <p>
            {t('terms.sections.privacyAndCopyright.description')}
          </p>

          <h2 className="text-xl font-semibold">
            {t('terms.sections.modifyingAndTerminating.title')}
          </h2>
          <p>
            {t('terms.sections.modifyingAndTerminating.description')}
          </p>

          <h2 className="text-xl font-semibold">
            {t('terms.sections.warrantiesAndDisclaimers.title')}
          </h2>
          <p>
            {t('terms.sections.warrantiesAndDisclaimers.description')}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/login">{t('terms.buttons.backToLogin')}</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">{t('terms.buttons.signUp')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
