import { useTranslation } from '@dropit/i18n';
import {
  Outlet,
  createFileRoute,
} from '@tanstack/react-router';
import { HeaderPage } from '../shared/components/layout/header-page';

export const Route = createFileRoute('/__home/library')({
  component: LibraryLayout,
});

function LibraryLayout() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <HeaderPage
        title={t('library.title')}
        description={t('library.description')}
      />

      <div className="mt-6 h-full flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
