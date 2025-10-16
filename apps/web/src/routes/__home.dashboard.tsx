import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card';
import { Button } from '../shared/components/ui/button';
import { Badge } from '../shared/components/ui/badge';
import { Users, Calendar, Dumbbell, TrendingUp, Plus, UserPlus, CalendarPlus, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

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
      <p className="text-muted-foreground mb-6">{t('dashboard.description')}</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Athlètes actifs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                +2 ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Séances prévues
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-blue-600 flex items-center gap-1">
                12 aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exercices disponibles
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                +5 récents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de participation
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                +3% ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer une nouvelle séance
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un athlète
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Planifier un entrainement
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Séances d'aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Groupe Elite - Force</p>
                  <p className="text-sm text-muted-foreground">9:00 - 10:30</p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  En cours
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Formation junior</p>
                  <p className="text-sm text-muted-foreground">14:00 - 15:30</p>
                </div>
                <Badge variant="secondary">
                  Planifiée
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
