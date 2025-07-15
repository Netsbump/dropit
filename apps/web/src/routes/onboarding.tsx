import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { 
  Trophy, 
  ArrowRight,
  Building,
  UserCheck
} from 'lucide-react';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: OnboardingChoice,
});

function OnboardingChoice() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();

  const handleChoice = (choice: 'coach' | 'athlete') => {
    if (choice === 'coach') {
      navigate({ to: '/create-organization' });
    } else {
      navigate({ to: '/join-organization' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Building className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('onboarding.welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('onboarding.welcome.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Option Coach */}
          <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer group">
            <div 
              onClick={() => handleChoice('coach')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('coach');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Choisir le rôle de coach"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">{t('onboarding.roles.coach.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('onboarding.roles.coach.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('onboarding.roles.coach.features.create_organization')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('onboarding.roles.coach.features.manage_athletes')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('onboarding.roles.coach.features.create_programs')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('onboarding.roles.coach.features.track_performance')}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {t('onboarding.roles.coach.button')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Option Athlète */}
          <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer group">
            <div 
              onClick={() => handleChoice('athlete')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('athlete');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Choisir le rôle d'athlète"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-700">{t('onboarding.roles.athlete.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('onboarding.roles.athlete.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{t('onboarding.roles.athlete.features.join_club')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{t('onboarding.roles.athlete.features.follow_training')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{t('onboarding.roles.athlete.features.record_performance')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{t('onboarding.roles.athlete.features.communicate_coach')}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {t('onboarding.roles.athlete.button')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('onboarding.footer.unsure')}{' '}
            <a href="/help" className="text-blue-600 hover:underline">
              {t('onboarding.footer.learn_more')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant CheckCircle pour les listes
const CheckCircle = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    role="img"
    aria-label="Checkmark"
  >
    <title>Checkmark</title>
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
      clipRule="evenodd" 
    />
  </svg>
); 