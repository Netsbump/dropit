import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Card, CardContent, CardHeader } from '../shared/components/ui/card';
import { Button } from '../shared/components/ui/button';
import { ScrollArea } from '../shared/components/ui/scroll-area';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const Route = createFileRoute('/__home/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('dashboard.title') });
  }, [setPageMeta, t]);

  // Données pour le graphique de participation (6 derniers mois)
  const participationData = [
    { month: 'Mai', rate: 68 },
    { month: 'Juin', rate: 10 },
    { month: 'Juil', rate: 72 },
    { month: 'Août', rate: 50 },
    { month: 'Sept', rate: 60 },
    { month: 'Oct', rate: 94 },
  ];

  // Données pour le graphique de répartition des entraînements
  const trainingDistribution = [
    { name: 'Exercices', value: 89, color: 'hsl(256, 100%, 65%)' }, // purple-700
    { name: 'Complexes', value: 24, color: 'hsl(256, 100%, 85%)' }, // purple-500
    { name: 'Entraînements', value: 32, color: 'hsl(256, 100%, 88%)' }, // purple-300
  ];

  // Générer les 7 prochains jours pour le calendrier
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        date: date.getDate(),
        hasSession: i === 2, // Session dans 2 jours
      });
    }
    return days;
  };

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
                    <p className="text-gray-500 text-md">Athlètes dans votre club</p>
                    <p className="font-bold text-gray-800 text-3xl">24</p>
                  </div>
                  <Button className="w-full text-md h-10 rounded-full">
                    Inviter un athlète
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Colonne 2 : Planning */}
            <Card className="flex-1 bg-background border rounded-2xl flex flex-col justify-center shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <p className="text-gray-500 text-md">Sessions programmées</p>
                    <p className="font-bold text-gray-800 text-3xl">12</p>
                  </div>
                  <Button className="w-full text-md h-10 rounded-full">
                    Ajouter une séance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Colonne 3: Entrainements */}
            <Card className="flex-1 bg-background border rounded-2xl flex flex-col justify-center shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <p className="text-gray-500 text-md">Entrainements programmés</p>
                    <p className="font-bold text-gray-800 text-3xl">12</p>
                  </div>
                  <Button className="w-full text-md h-10 rounded-full">
                    Créer un entraînement
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
              <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={participationData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      formatter={(value: number) => [`${value}%`, 'Taux']}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Planning */}
          <Card className="flex-1 bg-background border rounded-2xl shadow-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-500 text-md">Planning des 7 prochains jours</p>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-lg transition-all",
                          day.hasSession
                            ? "bg-purple-500 text-white"
                            : index === 0
                            ? "bg-purple-100 border border-purple-300 text-purple-700"
                            : "bg-white/60 border"
                        )}
                      >
                        <span className="text-xs font-medium mb-1">{day.day}</span>
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
                  <p className="text-gray-500 text-md">Répartition bibliothèque</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trainingDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {trainingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 px-4">
                    {trainingDistribution.map((item) => (
                      <div className="flex items-center border rounded-lg justify-center gap-2 p-2" key={item.name}>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        <div className="flex justify-between w-full items-center">
                          <p className="text-md text-gray-600">{item.name}</p>
                          <p className="text-md font-bold text-gray-800">{item.value}</p>
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
                    <p className="font-medium text-md text-gray-700">Nouvelle session de force débute lundi</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">Compétition régionale ce weekend</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 5 heures</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">Mise à jour du planning de novembre</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 1 jour</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border">
                    <p className="font-medium text-md text-gray-700">3 nouveaux athlètes ont rejoint le club</p>
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
                  <p className="text-gray-500 text-md">Prochaines compétitions</p>
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
