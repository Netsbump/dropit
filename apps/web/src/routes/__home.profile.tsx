import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { useEffect } from 'react';
import { UserProfileSection } from '@/features/profile/user-profile-section';
import { AthleteProfileSection } from '@/features/profile/athlete-profile-section';
import { DangerZoneSection } from '@/features/profile/danger-zone-section';
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: User Profile + Danger Zone */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <UserProfileSection />
              <div className="border-t pt-6">
                <DangerZoneSection />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Athlete Profile */}
        <div>
          <AthleteProfileSection />
        </div>
      </div>
    </div>
  );
}
