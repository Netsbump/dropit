import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { useEffect } from 'react';
import { UserProfileSection } from '@/features/profile/user-profile-section';
import { AthleteProfileSection } from '@/features/profile/athlete-profile-section';
import { DangerZoneSection } from '@/features/profile/danger-zone-section';
import { SettingsSection } from '@/features/profile/settings-section';
import { Card, CardContent } from '@/shared/components/ui/card';

export const Route = createFileRoute('/__home/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(['profile']);
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('profile:title') });
  }, [setPageMeta, t]);

  return (
    <div className="container p-4 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Left Column: User Profile + Settings + Danger Zone */}
        <div className="space-y-6 w-full">
          <Card className="w-full shadow-none">
            <CardContent className="p-6 space-y-6">
              <UserProfileSection />
              <div className="border-t pt-6">
                <SettingsSection />
              </div>
              <div className="border-t pt-6">
                <DangerZoneSection />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Athlete Profile */}
        <div className="w-full">
          <AthleteProfileSection />
        </div>
      </div>
    </div>
  );
}
