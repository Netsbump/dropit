import { AthleteDetail } from '@/features/athletes/athlete-detail';
import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { toast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import {
  CompetitorLevel,
  CreateCompetitorStatus,
  SexCategory,
  UpdateCompetitorStatus,
  createCompetitorStatusSchema,
  updateCompetitorStatusSchema,
} from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/athletes/$athleteId')({
  component: AthleteDetailPage,
});

function AthleteDetailPage() {
  const { athleteId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { t } = useTranslation(['common', 'athletes']);
  const [isEditingCompetitorStatus, setIsEditingCompetitorStatus] =
    useState(false);
  const [isCreatingCompetitorStatus, setIsCreatingCompetitorStatus] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: athlete, isLoading: athleteLoading } = useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      const response = await api.athlete.getAthlete({
        params: { id: athleteId },
      });
      if (response.status !== 200)
        throw new Error('Failed to load athlete details');
      return response.body;
    },
  });

  // L'erreur de linter indique que ces variables ne sont pas utilisées, mais gardons
  // la requête pour s'assurer que les données sont chargées - potentiel usage futur
  useQuery({
    queryKey: ['competitorStatus', athleteId],
    queryFn: async () => {
      // Ne pas exécuter la requête si l'athlète n'est pas encore chargé
      if (!athlete?.id) return null;

      const response = await api.competitorStatus.getCompetitorStatus({
        params: { id: athlete.id },
      });
      if (response.status !== 200)
        throw new Error('Failed to load competitor status');
      return response.body;
    },
    enabled: !!athlete?.id, // Exécuter seulement si athlete.id existe
  });

  // Mutation for creating a new competitor status
  const createCompetitorStatus = async (data: CreateCompetitorStatus) => {
    setIsLoading(true);
    try {
      // S'assurer que athlete existe
      if (!athlete) {
        throw new Error('Athlète non trouvé');
      }

      const requestBody: CreateCompetitorStatus = {
        level: data.level,
        sexCategory: data.sexCategory,
        weightCategory: data.weightCategory,
        athleteId: athlete.id,
      };

      const response = await api.competitorStatus.createCompetitorStatus({
        body: requestBody,
      });

      if (response.status !== 201) {
        throw new Error(
          "Erreur lors de la création du nouveau statut compétitif de l'athlète"
        );
      }
      toast({
        title: 'Nouveau statut compétitif créé',
        description:
          "Un nouveau statut compétitif a été créé pour l'athlète, l'ancien statut a été archivé",
      });
      setIsCreatingCompetitorStatus(false);
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athlete', athleteId] });
      return response.body;
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mutation for updating athlete competitor status (correction only)
  const updateCompetitorStatus = async (data: UpdateCompetitorStatus) => {
    setIsLoading(true);
    try {
      // Vérifier que l'athlète existe
      if (!athlete) {
        throw new Error('Athlète non trouvé');
      }

      // Obtenir le dernier statut compétitif avec l'ID via une requête dédiée
      const getStatusResponse = await api.competitorStatus.getCompetitorStatus({
        params: { id: athlete.id },
      });

      if (getStatusResponse.status !== 200 || !getStatusResponse.body.id) {
        throw new Error('Impossible de récupérer le statut compétitif actuel');
      }

      // Utiliser l'ID obtenu de la réponse pour la mise à jour
      const competitorStatusId = getStatusResponse.body.id;

      const requestBody: UpdateCompetitorStatus = {
        level: data.level,
        sexCategory: data.sexCategory,
        weightCategory: data.weightCategory,
      };

      const response = await api.competitorStatus.updateCompetitorStatus({
        params: { id: competitorStatusId },
        body: requestBody,
      });

      if (response.status !== 200) {
        throw new Error(
          "Erreur lors de la correction du statut compétitif de l'athlète"
        );
      }
      toast({
        title: 'Statut compétitif corrigé avec succès',
        description:
          "Le statut compétitif de l'athlète a été corrigé avec succès",
      });
      setIsEditingCompetitorStatus(false);
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athlete', athleteId] });
      queryClient.invalidateQueries({
        queryKey: ['competitorStatus', athleteId],
      });
      return response.body;
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form setup for updating competitor status
  const updateCompetitorStatusForm = useForm<UpdateCompetitorStatus>({
    resolver: zodResolver(updateCompetitorStatusSchema),
    defaultValues: {
      level: CompetitorLevel.ROOKIE,
      sexCategory: SexCategory.MEN,
      weightCategory: 0,
    },
  });

  // Form setup for creating competitor status
  const createCompetitorStatusForm = useForm<CreateCompetitorStatus>({
    resolver: zodResolver(createCompetitorStatusSchema),
    defaultValues: {
      level: CompetitorLevel.ROOKIE,
      sexCategory: SexCategory.MEN,
      weightCategory: 0,
    },
  });

  // Update form values when athlete data is loaded
  useEffect(() => {
    if (athlete?.competitorStatus) {
      updateCompetitorStatusForm.reset({
        level: athlete.competitorStatus.level as CompetitorLevel,
        sexCategory: athlete.competitorStatus.sexCategory as SexCategory,
        weightCategory: athlete.competitorStatus.weightCategory || 0,
      });
    }
  }, [athlete, updateCompetitorStatusForm]);

  if (athleteLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {t('common:loading')}
      </div>
    );
  }

  if (!athlete) {
    return <div>{t('common:not_found')}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: '/athletes' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {athlete.firstName} {athlete.lastName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <AthleteDetail
            athlete={athlete}
            isEditingCompetitorStatus={isEditingCompetitorStatus}
            setIsEditingCompetitorStatus={setIsEditingCompetitorStatus}
            isCreatingCompetitorStatus={isCreatingCompetitorStatus}
            setIsCreatingCompetitorStatus={setIsCreatingCompetitorStatus}
            updateCompetitorStatusForm={updateCompetitorStatusForm}
            createCompetitorStatusForm={createCompetitorStatusForm}
            isLoading={isLoading}
            onUpdateCompetitorStatus={updateCompetitorStatus}
            onCreateCompetitorStatus={createCompetitorStatus}
          />
        </div>
      </div>
    </div>
  );
}
