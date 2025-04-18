import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Pencil } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the Athlete type to replace any
interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | string;
  email: string;
  country?: string;
  avatar?: string;
  club?: { id: string };
  metrics?: unknown;
  personalRecords?: unknown;
  competitorStatus?: unknown;
}

export const Route = createFileRoute('/athletes/$athleteId')({
  component: AthleteDetailPage,
});

// Validation schema for updating an athlete
const updateAthleteSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  birthday: z.string(),
  country: z.string().optional(),
});

type UpdateAthleteData = z.infer<typeof updateAthleteSchema>;

function AthleteDetailPage() {
  const { athleteId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { t } = useTranslation(['common', 'athletes']);
  const [isEditing, setIsEditing] = useState(false);
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
      return response.body as Athlete;
    },
  });

  // Mutation for updating athlete
  const updateAthlete = async (data: UpdateAthleteData) => {
    setIsLoading(true);
    try {
      const response = await api.athlete.updateAthlete({
        params: { id: athleteId },
        body: data,
      });
      if (response.status !== 200) {
        throw new Error("Erreur lors de la modification de l'athlète");
      }
      toast({
        title: 'Athlète modifié avec succès',
        description: "L'athlète a été modifié avec succès",
      });
      setIsEditing(false);
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

  // Form setup
  const form = useForm<UpdateAthleteData>({
    resolver: zodResolver(updateAthleteSchema),
    defaultValues: athlete
      ? {
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          birthday:
            athlete.birthday instanceof Date
              ? format(athlete.birthday, 'yyyy-MM-dd')
              : format(new Date(athlete.birthday), 'yyyy-MM-dd'),
          country: athlete.country ?? '',
        }
      : undefined,
  });

  // Update form values when athlete data is loaded
  React.useEffect(() => {
    if (athlete) {
      form.reset({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        birthday:
          athlete.birthday instanceof Date
            ? format(athlete.birthday, 'yyyy-MM-dd')
            : format(new Date(athlete.birthday), 'yyyy-MM-dd'),
        country: athlete.country ?? '',
      });
    }
  }, [athlete, form]);

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Pencil className="h-4 w-4 mr-2" />
              {isEditing ? t('common:cancel') : t('common:edit')}
            </Button>
            {isEditing && (
              <Button
                type="submit"
                onClick={form.handleSubmit(updateAthlete)}
                disabled={isLoading}
              >
                {t('common:save')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {isEditing ? (
            <EditAthleteForm
              form={form}
              athlete={athlete}
              isLoading={isLoading}
              onSubmit={updateAthlete}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <AthleteInfo athlete={athlete} />
          )}
        </div>
      </div>
    </div>
  );
}

function AthleteInfo({ athlete }: { athlete: Athlete }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-background rounded-md shadow-none">
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold mb-4">
              Informations personnelles
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <p className="text-sm">{athlete.firstName}</p>
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <p className="text-sm">{athlete.lastName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <p className="text-sm">
                {format(new Date(athlete.birthday), 'Pp', { locale: fr })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pays</Label>
              <p className="text-sm">{athlete.country || '-'}</p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm">{athlete.email}</p>
            </div>

            {athlete.club && (
              <div className="space-y-2">
                <Label>Club</Label>
                <p className="text-sm">Club ID: {athlete.club.id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Club */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-4">Statistiques</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Dernière activité
                  </div>
                  <div className="text-lg font-semibold">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Nombre d'entraînements
                  </div>
                  <div className="text-lg font-semibold">0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info placeholder */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-4">Programmes actifs</h2>
              <div className="text-sm text-muted-foreground">
                Aucun programme actif
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold mb-4">
            Historique des entrainements
          </h2>
          <div className="text-sm text-muted-foreground">
            Aucun entrainement n'a encore été réalisé
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditAthleteFormProps {
  form: ReturnType<typeof useForm<UpdateAthleteData>>;
  athlete: Athlete;
  isLoading: boolean;
  onSubmit: (data: UpdateAthleteData) => void;
  onCancel: () => void;
}

function EditAthleteForm({ form, athlete, onSubmit }: EditAthleteFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-background rounded-md shadow-none">
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold mb-4">
              Modifier les informations
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl className="bg-white">
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl className="bg-white">
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance</FormLabel>
                  <FormControl className="bg-white">
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl className="bg-white">
                    <Input placeholder="Pays" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm">{athlete.email}</p>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
