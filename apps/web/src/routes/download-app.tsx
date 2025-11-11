import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "@dropit/i18n";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Smartphone, Download, Apple, ArrowRight, CheckCircle, Star } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useState, useEffect } from "react";

export const Route = createFileRoute('/download-app')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: DownloadAppPage,
}); 

function DownloadAppPage() {
  const { t } = useTranslation('onboarding');
  const [activeMember, setActiveMember] = useState<{ role: string } | null>(null);

  const features = t('download_app.features.list', { returnObjects: true }) as string[];
  
  // Récupérer le membre actif au montage du composant
  useEffect(() => {
    const fetchActiveMember = async () => {
      try {
        const response = await authClient.organization.getActiveMember();
        if (response.data) {
          setActiveMember(response.data);
        }
      } catch (error) {
        console.error('Error fetching active member:', error);
      }
    };
    
    fetchActiveMember();
  }, []);
  
  // Vérifier si l'utilisateur est un membre (athlète)
  const isAthlete = activeMember?.role === 'member';

  const handleDownload = (platform: 'ios' | 'android') => {
    // TODO: Implémenter les liens de téléchargement
    switch (platform) {
      case 'ios':
        window.open('https://apps.apple.com/app/dropit', '_blank');
        break;
      case 'android':
        window.open('https://play.google.com/store/apps/details?id=com.dropit', '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Smartphone className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isAthlete ? 'Bienvenue sur DropIt !' : t('download_app.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isAthlete 
              ? 'L\'interface web est réservée aux coachs pour la gestion des programmes d\'entraînement. Votre espace athlète vous attend sur mobile !'
              : t('download_app.description')
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Carte principale */}
          <Card className="w-full h-full flex flex-col shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('download_app.download_section.title')}</CardTitle>
              <CardDescription>
                {t('download_app.download_section.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
              {/* App Store */}
              <Button
                onClick={() => handleDownload('ios')}
                className="w-full h-16 text-lg bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                <Apple className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="text-xs">{t('download_app.platforms.ios.label')}</div>
                  <div className="font-semibold">{t('download_app.platforms.ios.store')}</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto" />
              </Button>

              {/* Google Play */}
              <Button
                onClick={() => handleDownload('android')}
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Download className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="text-xs">{t('download_app.platforms.android.label')}</div>
                  <div className="font-semibold">{t('download_app.platforms.android.store')}</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Carte des fonctionnalités */}
          <Card className="w-full h-full flex flex-col shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t('download_app.features.title')}
              </CardTitle>
              <CardDescription>
                {t('download_app.features.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {t('download_app.stats.rating')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {t('download_app.stats.downloads')}
                  </Badge>
                </div>
                <p className="text-xs text-center text-gray-500">
                  {t('download_app.stats.optimized')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('download_app.footer.support')}{' '}
            <a href="/support" className="text-purple-600 hover:underline">
              {t('download_app.footer.contact')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}