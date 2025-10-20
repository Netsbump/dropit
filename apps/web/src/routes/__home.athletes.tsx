import { api } from '@/lib/api';
import { useTranslation } from '@dropit/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AthleteInvitationForm } from '../features/athletes/athlete-invitation-form';
import { columns } from '../features/athletes/columns';
import { DataTable } from '../features/athletes/data-table';
import { DialogCreation } from '../features/athletes/dialog-creation';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Button } from '../shared/components/ui/button';

export const Route = createFileRoute('/__home/athletes')({
  component: AthletesPage,
});

function AthletesPage() {
  const { t } = useTranslation(['common', 'athletes']);
  const { setPageMeta } = usePageMeta();
  const [createAthleteModalOpen, setCreateAthleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const isAthleteDetail = matches.some(
    (match) => match.routeId === '/__home/athletes/$athleteId'
  );

  useEffect(() => {
    setPageMeta({ title: t('athletes:title') });
  }, [setPageMeta, t]);

  const { data: athletes, isLoading: athletesLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const response = await api.athlete.getAthletes();
      if (response.status !== 200) throw new Error('Failed to load athletes');
      return response.body;
    },
  });

  const handleCreationSuccess = () => {
    setCreateAthleteModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['athletes'] });
  };

  // Si on est sur un détail d'athlète, on affiche directement le contenu
  if (isAthleteDetail) {
    return <Outlet />;
  }

  return (
    <div className="relative flex-1 p-8">
      <p className="text-muted-foreground mb-6">{t('athletes:description')}</p>

      <div>
        {athletesLoading ? (
          <div className="flex items-center justify-center h-32">
            {t('common:loading')}
          </div>
        ) : !athletes?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>{t('common:no_results')}</p>
            <p className="text-sm">{t('common:start_create')}</p>
            <Button onClick={() => setCreateAthleteModalOpen(true)}>
              {t('athletes:filters.create_athlete')}
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={athletes}
            onDialogCreation={setCreateAthleteModalOpen}
            onRowClick={(athleteId) =>
              navigate({ to: `/athletes/${athleteId}` })
            }
          />
        )}
      </div>

      <DialogCreation
        open={createAthleteModalOpen}
        onOpenChange={setCreateAthleteModalOpen}
        title={t('athletes:invitation.title')}
        description={t('athletes:invitation.description')}
      >
        <AthleteInvitationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateAthleteModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
