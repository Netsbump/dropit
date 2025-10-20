import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card';
import { Badge } from '../shared/components/ui/badge';
import { Button } from '../shared/components/ui/button';
import { Users, Calendar, Library, TrendingUp, Newspaper, UserPlus, Plus, CalendarPlus } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/__home/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('dashboard.title') });
  }, [setPageMeta, t]);

  return (
    <div className="relative flex-1 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Overview Card - Large */}
        <Card className={cn(
          "lg:col-span-2 relative overflow-visible rounded-2xl shadow-sm",
          "bg-white/80 backdrop-blur-sm border border-gray-200"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">Overview</CardTitle>
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">
                Mensuel
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Image illustration qui déborde en haut */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none">
              <img
                src="/src/assets/images/hero-pages/199306.svg"
                alt=""
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-8 pt-48">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Total Athlètes</p>
                <p className="text-4xl font-bold text-gray-800 mb-1">24</p>
                <p className="text-xs text-gray-400">Dans le club</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Séances programmées</p>
                <p className="text-4xl font-bold text-gray-800 mb-1">156</p>
                <p className="text-xs text-gray-400">Ce mois</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Entraînements créés</p>
                <p className="text-4xl font-bold text-gray-800 mb-1">89</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-6'>
          {/* Taux de participation */}
          <Card className={cn(
            "relative overflow-hidden rounded-2xl shadow-sm",
            "bg-orange-50 border border-orange-100"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Taux de participation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <p className="text-5xl font-bold text-gray-800 mb-1">94%</p>
                <p className="text-gray-600 text-sm">Ce mois</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-300 border-0 text-xs">
                  +3% ce mois
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "relative overflow-hidden rounded-2xl shadow-sm",
            "bg-pink-50 border border-pink-100"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
                  <Newspaper className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Actualité du club</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white/50 rounded-xl p-3 border border-pink-100">
                  <p className="font-medium text-sm text-gray-800">Nouvelle session de force débute lundi</p>
                  <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-pink-100">
                  <p className="font-medium text-sm text-gray-800">Compétition régionale ce weekend</p>
                  <p className="text-xs text-gray-500 mt-1">Il y a 5 heures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trois cards en bas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Athlètes */}
        <Card className="relative overflow-visible bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          {/* Icône qui déborde */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 inline-flex items-center justify-center shadow-lg shrink-0">
            <Users className="h-8 w-8 text-white shrink-0" />
          </div>

          <CardContent className="p-6 pt-12">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="font-bold text-gray-800 text-6xl">24</p>
                <p className="text-gray-600 text-sm">athlètes dans votre club</p>
              </div>
              <Button className="w-full bg-transparent hover:bg-purple-50 text-purple-700 border border-purple-200 h-10" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter un athlète
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bibliothèque */}
        <Card className="relative overflow-visible bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          {/* Icône qui déborde */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 inline-flex items-center justify-center shadow-lg shrink-0">
            <Library className="h-8 w-8 text-white shrink-0" />
          </div>

          <CardContent className="p-6 pt-12">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="font-bold text-gray-800 text-6xl">89</p>
                <p className="text-gray-600 text-sm">exercices dans votre bibliothèque</p>
              </div>
              <Button className="w-full bg-transparent hover:bg-blue-50 text-blue-700 border border-blue-200 h-10" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Créer un entraînement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planning */}
        <Card className="relative overflow-visible bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          {/* Icône qui déborde */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 inline-flex items-center justify-center shadow-lg shrink-0">
            <Calendar className="h-8 w-8 text-white shrink-0" />
          </div>

          <CardContent className="p-6 pt-12">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="font-bold text-gray-800 text-6xl">12</p>
                <p className="text-gray-600 text-sm">sessions de programmées</p>
              </div>
              <Button className="w-full bg-transparent hover:bg-orange-50 text-orange-700 border border-orange-200 h-10" size="sm">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Ajouter une séance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
