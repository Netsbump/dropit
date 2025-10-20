import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import {
  Trophy,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 w-32 h-32 flex items-center justify-center">
            <img
              src="/src/assets/images/hero-pages/199306.svg"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('onboarding.welcome.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('onboarding.welcome.subtitle')}
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Option Coach */}
          <Card
            className={cn(
              "relative overflow-visible cursor-pointer group transition-all duration-200",
              "bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm",
              "hover:shadow-lg hover:scale-[1.02]"
            )}
          >
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
              className="p-8"
            >
              <CardHeader className="text-center p-0 mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800 mb-2">{t('onboarding.roles.coach.title')}</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {t('onboarding.roles.coach.description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>{t('onboarding.roles.coach.features.create_organization')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>{t('onboarding.roles.coach.features.manage_athletes')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>{t('onboarding.roles.coach.features.create_programs')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>{t('onboarding.roles.coach.features.track_performance')}</span>
                  </li>
                </ul>

                <Button
                  className="w-full h-11 text-base shadow hover:shadow-md transition-shadow"
                  size="lg"
                >
                  {t('onboarding.roles.coach.button')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Option Athlète */}
          <Card
            className={cn(
              "relative overflow-visible cursor-pointer group transition-all duration-200",
              "bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm",
              "hover:shadow-lg hover:scale-[1.02]"
            )}
          >
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
              className="p-8"
            >
              <CardHeader className="text-center p-0 mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <UserCheck className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800 mb-2">{t('onboarding.roles.athlete.title')}</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {t('onboarding.roles.athlete.description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>{t('onboarding.roles.athlete.features.join_club')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>{t('onboarding.roles.athlete.features.follow_training')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>{t('onboarding.roles.athlete.features.record_performance')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>{t('onboarding.roles.athlete.features.communicate_coach')}</span>
                  </li>
                </ul>

                <Button
                  className="w-full h-11 text-base bg-orange-500 hover:bg-orange-600 text-white shadow hover:shadow-md transition-shadow"
                  size="lg"
                >
                  {t('onboarding.roles.athlete.button')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Composant CheckIcon simplifié
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
); 