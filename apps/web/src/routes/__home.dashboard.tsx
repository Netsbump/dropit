import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card';
import { Button } from '../shared/components/ui/button';
import { ScrollArea } from '../shared/components/ui/scroll-area';
import { Users, Calendar, TrendingUp, Newspaper } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/__home/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const { setPageMeta } = usePageMeta();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setPageMeta({ title: t('dashboard.title') });
  }, [setPageMeta, t]);

  const firstName = session?.user?.name?.split(' ')[0] || 'Coach';

  // Données pour le graphique de participation (6 derniers mois)
  const participationData = [
    { month: 'Mai', rate: 78 },
    { month: 'Juin', rate: 82 },
    { month: 'Juil', rate: 75 },
    { month: 'Août', rate: 88 },
    { month: 'Sept', rate: 85 },
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
      <div className="relative px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
        {/* Overview Card - Large */}
        <Card className="lg:col-span-2 relative overflow-visible rounded-2xl flex flex-col min-h-[400px] bg-white border border-gray-200">
          <CardHeader className="relative pb-0 flex-1 z-10">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] pointer-events-none">
              <img
                src="/src/assets/images/hero-pages/199306.svg"
                alt=""
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </CardHeader>
          <CardContent className="mt-auto pb-8 relative z-10 px-12">
            <div className="text-left space-y-2">
              <h2 className="text-4xl font-bold text-gray-800">
                {t('dashboard.welcome.greeting', { name: firstName })}
              </h2>
              <p className="text-base text-gray-600 max-w-xl">
                {t('dashboard.welcome.description')}
              </p>
            </div>
          </CardContent>

          {/* Wave SVG Background - Right wave (bottom) */}
          <div className="absolute bottom-0 right-0 w-1/2 h-4/5 z-0 pointer-events-none overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" className="w-full h-full" preserveAspectRatio="none">
              <path
                fill="hsl(256, 100%, 82%)"
                fillOpacity="0.25"
                d="M400,600 Q280,480 320,300 Q360,120 400,0 L400,600 Z"
              />
            </svg>
          </div>

          {/* Wave SVG Background - Left wave (top, subtle) */}
          <div className="absolute top-0 left-0 w-1/2 h-4/5 z-0 pointer-events-none overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" className="w-full h-full" preserveAspectRatio="none">
              <path
                fill="hsl(256, 100%, 85%)"
                fillOpacity="0.15"
                d="M0,0 Q120,120 80,300 Q40,480 0,600 L0,0 Z"
              />
            </svg>
          </div>
        </Card>

        <div className='flex flex-col gap-6'>
          {/* Taux de participation */}
          <Card className="rounded-2xl bg-white/80 border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Taux de participation</p>
                  <p className="text-3xl font-bold text-gray-800">94%</p>
                </div>
                <div className="w-10 h-10 rounded-xl border border-orange-200 bg-orange-100 inline-flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={participationData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      formatter={(value: number) => [`${value}%`, 'Taux']}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/80 border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-800">Actualité du club</CardTitle>
                <div className="w-12 h-12 rounded-2xl border border-purple-200 bg-purple-100 inline-flex items-center justify-center">
                  <Newspaper className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white/50 rounded-xl p-3 border border-purple-100">
                  <p className="font-medium text-sm text-gray-800">Nouvelle session de force débute lundi</p>
                  <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-purple-100">
                  <p className="font-medium text-sm text-gray-800">Compétition régionale ce weekend</p>
                  <p className="text-xs text-gray-500 mt-1">Il y a 5 heures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Grille de cards en bas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne 1 : Athlètes */}
          <div className="flex flex-col gap-6">
            {/* Athlètes */}
            <Card className="flex-1 bg-white/80 border border-gray-200 rounded-2xl">
              <CardContent className="p-6 pt-12">
                <div className="space-y-6">
                  <div className="space-y-2 flex flex-col px-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800 text-6xl">24</p>
                      <div className="w-16 h-16 rounded-2xl border border-purple-200 bg-purple-100 inline-flex items-center justify-center">
                      <Users className="h-8 w-8 text-purple-700" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-md">athlètes dans votre club</p>
                  </div>
                  <Button className="w-full">
                    Inviter un athlète
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compétition */}
            <Card className="flex-1 bg-white/80 border border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Prochaine compétition</h3>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-orange-100">
                    <p className="text-sm text-gray-600 mb-2">Régional Nord - 28 Octobre</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-purple-700">8</p>
                      <p className="text-sm text-gray-600">athlètes inscrits</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne 2 : Planning */}
          <div className="flex flex-col gap-6">
            {/* Planning */}
            <Card className="flex-1 bg-white/80 border border-gray-200 rounded-2xl">
              <CardContent className="p-6 pt-12">
                <div className="space-y-6">
                  <div className="space-y-2 flex flex-col px-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800 text-6xl">12</p>
                      <div className="w-16 h-16 rounded-2xl border border-purple-200 bg-purple-100 inline-flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-purple-700" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-md">sessions programmées</p>
                  </div>
                  <Button className="w-full">
                    Ajouter une séance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mini calendrier */}
            <Card className="flex-1 bg-white/80 border border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 text-center">7 prochains jours</h3>
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
                            : "bg-white/60 border border-purple-100"
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
                  <p className="text-xs text-gray-600 text-center">Une session programmée</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne 3 : Répartition bibliothèque */}
          <div className="flex flex-col">
            {/* Répartition */}
            <Card className="bg-white/80 border border-gray-200 rounded-2xl flex-1 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 text-center">Répartition bibliothèque</h3>
                    <div className="h-64">
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
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {trainingDistribution.map((item) => (
                        <div key={item.name}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          </div>
                          <p className="text-xs text-gray-600">{item.name}</p>
                          <p className="text-sm font-bold text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    Créer un entraînement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
