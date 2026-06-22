import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '@/hooks/use-page-meta';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { lazy, Suspense, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const ParticipationChart = lazy(() =>
  import('@/features/dashboard/dashboard-charts').then((m) => ({
    default: m.ParticipationChart,
  }))
);
const DistributionChart = lazy(() =>
  import('@/features/dashboard/dashboard-charts').then((m) => ({
    default: m.DistributionChart,
  }))
);

const getDaysArray = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: date.getDate(),
      hasSession: i === 2,
    });
  }
  return days;
};

export const Route = createFileRoute('/_home/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation(['dashboard']);
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('dashboard:title') });
  }, [setPageMeta, t]);

  const calendarDays = getDaysArray();

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="grid grid-cols-[3fr_2fr] gap-4 p-4 h-full">
        <div className="flex flex-col gap-4 h-full">
          {/* Row main KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {/* Colonne 1 : Athlètes */}
            <Card className="flex-1 bg-background border rounded-2xl flex flex-col justify-center shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <p className="text-gray-500 text-md">
                      Athlètes dans votre club
                    </p>
                    <p className="font-bold text-gray-800 text-3xl">24</p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-md h-10 rounded-full gap-2"
                  >
                    <Link to="/athletes">
                      Inviter un athlète
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Colonne 2 : Planning */}
            <Card className="flex-1 bg-background border rounded-2xl flex flex-col justify-center shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <p className="text-gray-500 text-md">
                      Sessions programmées
                    </p>
                    <p className="font-bold text-gray-800 text-3xl">12</p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-md h-10 rounded-full gap-2"
                  >
                    <Link to="/planning">
                      Ajouter une séance
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Colonne 3: Entrainements */}
            <Card className="flex-1 bg-background border rounded-2xl flex flex-col justify-center shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <p className="text-gray-500 text-md">
                      Entrainements programmés
                    </p>
                    <p className="font-bold text-gray-800 text-3xl">12</p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-md h-10 rounded-full gap-2"
                  >
                    <Link to="/library/workouts">
                      Créer un entraînement
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/*Particitation graph*/}
          <Card className="rounded-2xl bg-background border shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex flex-col">
                  <p className="text-gray-500 text-md">Taux de participation</p>
                  <p className="font-bold text-gray-800 text-3xl">94%</p>
                </div>
              </div>
              <Suspense fallback={<div className="h-16" />}>
                <ParticipationChart />
              </Suspense>
            </CardContent>
          </Card>

          {/* Planning */}
          <Card className="flex-1 bg-background border rounded-2xl shadow-none">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-500 text-md">
                  Planning des 7 prochains jours
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={`${day.day}-${day.date}`}
                      className={cn(
                        'flex flex-col items-center p-2 rounded-lg transition-all',
                        day.hasSession
                          ? 'bg-purple-500 text-white'
                          : index === 0
                            ? 'bg-purple-100 border border-purple-300 text-purple-700'
                            : 'bg-white/60 border'
                      )}
                    >
                      <span className="text-xs font-medium mb-1">
                        {day.day}
                      </span>
                      <span className="text-lg font-bold">{day.date}</span>
                      {day.hasSession && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Library repartition */}
          <Card className="bg-background border rounded-2xl flex-1 flex flex-col shadow-none">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <p className="text-gray-500 text-md">
                    Répartition bibliothèque
                  </p>
                  <Suspense fallback={<div className="h-48" />}>
                    <DistributionChart />
                  </Suspense>
                  <div className="grid grid-cols-3 gap-4 px-4">
                    {[
                      {
                        name: 'Exercices',
                        value: 89,
                        color: 'hsl(256, 100%, 65%)',
                      },
                      {
                        name: 'Complexes',
                        value: 24,
                        color: 'hsl(256, 100%, 85%)',
                      },
                      {
                        name: 'Entraînements',
                        value: 32,
                        color: 'hsl(256, 100%, 88%)',
                      },
                    ].map((item) => (
                      <div
                        className="flex items-center border rounded-lg justify-center gap-2 p-2"
                        key={item.name}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex justify-between w-full items-center">
                          <p className="text-md text-gray-600">{item.name}</p>
                          <p className="text-md font-bold text-gray-800">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 gap-6">
          <Card className="rounded-2xl bg-background border shadow-none flex flex-col h-full">
            {/* Club news */}
            <div>
              <CardHeader className="pb-2">
                <p className="text-gray-500 text-md">Actualité du club</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">
                      Nouvelle session de force débute lundi
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Il y a 2 heures
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">
                      Compétition régionale ce weekend
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Il y a 5 heures
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">
                      Mise à jour du planning de novembre
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 1 jour</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">
                      3 nouveaux athlètes ont rejoint le club
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 2 jours</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-md mt-4">
                  Voir toutes les actualités
                </Button>
              </CardContent>
            </div>

            {/* Next competitions */}
            <div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-500 text-md">
                    Prochaines compétitions
                  </p>
                  <div className="bg-white rounded-xl p-4 border space-y-3">
                    <div>
                      <p className="font-bold text-gray-800">Régional Sénior</p>
                      <p className="text-sm text-gray-600">28 Octobre 2025</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-purple-700">8</p>
                      <p className="text-sm text-gray-600">athlètes inscrits</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
