import { CreationDialog } from '@/components/shared/creation-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { HeroCard } from '@/components/ui/hero-card';
import { Input } from '@/components/ui/input';
import { ServerPagination } from '@/components/ui/server-pagination';
import { useAthleteColumns } from '@/features/athletes/columns';
import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { useOffsetPagination } from '@/hooks/use-offset-pagination';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useTranslation } from '@dropit/i18n';
import { GLOBAL_ROLE, ORGANIZATION_ROLE } from '@dropit/schemas';
import { useQueryClient } from '@tanstack/react-query';
import {
  Outlet,
  createFileRoute,
  redirect,
  useMatches,
} from '@tanstack/react-router';
import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AthleteInvitationForm } from '../../features/athletes/athlete-invitation-form';
import { useAthletesPageQuery } from '../../features/athletes/use-athletes-page-query';

const ATHLETES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const INITIAL_ATHLETES_PAGE_SIZE = 20;

export const Route = createFileRoute('/_home/athletes')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.organizationRole !== ORGANIZATION_ROLE.ADMIN) {
      throw redirect({
        to:
          accessState.userRole === GLOBAL_ROLE.ADMIN ? '/admin' : '/dashboard',
      });
    }
  },
  component: AthletesPage,
});

function AthletesPage() {
  const { t } = useTranslation(['common', 'athletes']);
  const { setPageMeta } = usePageMeta();
  const [createAthleteModalOpen, setCreateAthleteModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const athletesPagination = useOffsetPagination(INITIAL_ATHLETES_PAGE_SIZE);
  const invitationFormId = 'athlete-invitation-form';
  const queryClient = useQueryClient();
  const columns = useAthleteColumns();
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const isAthleteDetail = matches.some(
    (match) => match.routeId === '/_home/athletes/$athleteId'
  );

  useEffect(() => {
    setPageMeta({ title: t('athletes:title') });
  }, [setPageMeta, t]);

  const searchQuery = search.trim();

  const {
    data: athletesPage,
    isLoading: athletesLoading,
    isFetching: athletesFetching,
  } = useAthletesPageQuery({
    limit: athletesPagination.limit,
    offset: athletesPagination.offset,
    search,
  });

  const athletes = athletesPage?.data ?? [];
  const pagination = athletesPage?.pagination ?? {
    limit: athletesPagination.limit,
    offset: athletesPagination.offset,
    total: 0,
    hasNext: false,
  };
  const handleCreationSuccess = () => {
    setCreateAthleteModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['athletes'] });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    athletesPagination.reset();
  };

  const handlePageSizeChange = (value: number) => {
    athletesPagination.setLimit(value);
  };

  // Si on est sur un détail d'athlète, on affiche directement le contenu
  if (isAthleteDetail) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Fixed header section */}
      <div className="flex-none">
        <HeroCard
          variant="athlete"
          title={t('athletes:hero.title')}
          description={t('athletes:hero.description')}
          stat={{
            label: t('athletes:hero.stat_label'),
            value: pagination.total,
            icon: Users,
            description: t('athletes:hero.stat_description'),
            callToAction: {
              text: t('athletes:hero.stat_cta'),
              onClick: () => {
                console.log('Open athletes tutorial video');
              },
            },
          }}
        />
      </div>

      {/* DataTable with internal scroll management */}
      <div className="flex min-h-0 flex-1 flex-col">
        {athletesLoading ? (
          <div className="flex items-center justify-center h-32">
            {t('common:loading')}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('athletes:filters.search_placeholder')}
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="bg-background pl-8"
                />
              </div>
              <Button onClick={() => setCreateAthleteModalOpen(true)}>
                {t('athletes:filters.create_athlete')}
              </Button>
            </div>

            {athletes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <p>{t('common:no_results')}</p>
                {!searchQuery ? (
                  <p className="text-sm">{t('common:start_create')}</p>
                ) : null}
                <Button onClick={() => setCreateAthleteModalOpen(true)}>
                  {t('athletes:filters.create_athlete')}
                </Button>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <DataTable
                  columns={columns}
                  data={athletes}
                  onRowClick={(athleteId) =>
                    navigate({ to: `/athletes/${athleteId}` })
                  }
                />

                <ServerPagination
                  pagination={pagination}
                  itemCount={athletes.length}
                  isFetching={athletesFetching}
                  pageSizeOptions={ATHLETES_PAGE_SIZE_OPTIONS}
                  onPageSizeChange={handlePageSizeChange}
                  onPreviousPage={athletesPagination.previousPage}
                  onNextPage={athletesPagination.nextPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <CreationDialog
        open={createAthleteModalOpen}
        onOpenChange={setCreateAthleteModalOpen}
        title={t('athletes:invitation.title')}
        description={t('athletes:invitation.description')}
        cancelLabel={t('athletes:invitation.button_cancel')}
        submitLabel={t('athletes:invitation.button_send')}
        submitFormId={invitationFormId}
      >
        <AthleteInvitationForm
          formId={invitationFormId}
          onSuccess={handleCreationSuccess}
        />
      </CreationDialog>
    </div>
  );
}
