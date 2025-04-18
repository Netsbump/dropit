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
import { Separator } from '@/shared/components/ui/separator';
import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface AthleteDetailProps {
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    email: string;
    country?: string;
    avatar?: string;
    club?: { id: string };
    metrics?: unknown;
    personalRecords?: unknown;
    competitorStatus?: unknown;
  };
}

// Validation schema for updating an athlete
const updateAthleteSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  birthday: z.string(),
  country: z.string().optional(),
});

type UpdateAthleteData = z.infer<typeof updateAthleteSchema>;

export function AthleteDetail({ athlete }: AthleteDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  console.log(athlete);
  // Mutation for updating athlete
  const { mutate: updateAthleteMutation } = useMutation({
    mutationFn: async (data: UpdateAthleteData) => {
      const response = await api.athlete.updateAthlete({
        params: { id: athlete.id },
        body: data,
      });
      if (response.status !== 200) {
        throw new Error("Erreur lors de la modification de l'athlète");
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Athlète modifié avec succès',
        description: "L'athlète a été modifié avec succès",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athlete'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (formValues: UpdateAthleteData) => {
    setIsLoading(true);

    try {
      updateAthleteMutation(formValues);
    } finally {
      setIsLoading(false);
    }
  };

  // Form setup
  const form = useForm<UpdateAthleteData>({
    resolver: zodResolver(updateAthleteSchema),
    defaultValues: {
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday:
        athlete.birthday instanceof Date
          ? format(athlete.birthday, 'yyyy-MM-dd')
          : format(new Date(athlete.birthday), 'yyyy-MM-dd'),
      country: athlete.country ?? '',
    },
  });

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-6">
            {/* Informations personnelles */}
            <Card className="bg-background rounded-md shadow-none">
              <CardContent className="space-y-4 pt-6">
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
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-background rounded-md shadow-none">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm">{athlete.email}</p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                Mettre à jour
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="space-y-4 pt-6">
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
        </CardContent>
      </Card>

      {/* Email */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm">{athlete.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Club */}
      {athlete.club && (
        <Card className="bg-background rounded-md shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Club</Label>
              <p className="text-sm">Club ID: {athlete.club.id}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-end">
        <Button variant="default" onClick={() => setIsEditing(true)}>
          Modifier
        </Button>
      </div>
    </div>
  );
}
