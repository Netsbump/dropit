import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import {
  AthleteDto,
  CompetitorLevel,
  CreateCompetitorStatus,
  SexCategory,
  UpdateCompetitorStatus,
} from '@dropit/schemas';
import { Label } from '@radix-ui/react-dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Plus } from 'lucide-react';
import { Form, useForm } from 'react-hook-form';

type AthleteDetailProps = {
  athlete: AthleteDto;
  isEditingCompetitorStatus: boolean;
  setIsEditingCompetitorStatus: (isEditing: boolean) => void;
  isCreatingCompetitorStatus: boolean;
  setIsCreatingCompetitorStatus: (isCreating: boolean) => void;
  updateCompetitorStatusForm: ReturnType<
    typeof useForm<UpdateCompetitorStatus>
  >;
  createCompetitorStatusForm: ReturnType<
    typeof useForm<CreateCompetitorStatus>
  >;
  isLoading: boolean;
  onUpdateCompetitorStatus: (data: UpdateCompetitorStatus) => void;
  onCreateCompetitorStatus: (data: CreateCompetitorStatus) => void;
};

export function AthleteDetail({
  athlete,
  isEditingCompetitorStatus,
  setIsEditingCompetitorStatus,
  isCreatingCompetitorStatus,
  setIsCreatingCompetitorStatus,
  updateCompetitorStatusForm,
  createCompetitorStatusForm,
  isLoading,
  onUpdateCompetitorStatus,
  onCreateCompetitorStatus,
}: AthleteDetailProps) {
  const { t } = useTranslation(['athletes']);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-background rounded-md shadow-none">
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('athletes:details.personal_info')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('athletes:details.first_name')}</Label>
                <p className="text-sm">{athlete.firstName}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('athletes:details.last_name')}</Label>
                <p className="text-sm">{athlete.lastName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('athletes:details.birthday')}</Label>
              <p className="text-sm">
                {formatDate(new Date(athlete.birthday), 'Pp', { locale: fr })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('athletes:details.country')}</Label>
              <p className="text-sm">{athlete.country || '-'}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('athletes:details.email')}</Label>
              <p className="text-sm">{athlete.email}</p>
            </div>

            {athlete.club && (
              <div className="space-y-2">
                <Label>{t('athletes:details.club')}</Label>
                <p className="text-sm">{athlete.club || '-'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Club */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-4">
                {t('athletes:details.statistics')}
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('athletes:details.last_activity')}
                  </div>
                  <div className="text-lg font-semibold">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('athletes:details.training_count')}
                  </div>
                  <div className="text-lg font-semibold">0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-4">
                {t('athletes:details.personal_records')}
              </h2>
              {athlete.personalRecords ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.snatch')}:{' '}
                    {athlete.personalRecords.snatch ?? '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.clean_and_jerk')}:{' '}
                    {athlete.personalRecords.cleanAndJerk ?? '-'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t('athletes:details.no_personal_records')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Status */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {t('athletes:details.competitor_status')}
                </h2>
                <div className="flex space-x-2">
                  {athlete.competitorStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingCompetitorStatus(
                          !isEditingCompetitorStatus
                        );
                        setIsCreatingCompetitorStatus(false);
                      }}
                      disabled={isCreatingCompetitorStatus}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {isEditingCompetitorStatus
                        ? t('athletes:details.cancel')
                        : t('athletes:details.edit')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingCompetitorStatus(
                        !isCreatingCompetitorStatus
                      );
                      setIsEditingCompetitorStatus(false);
                    }}
                    disabled={isEditingCompetitorStatus}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreatingCompetitorStatus
                      ? t('athletes:details.cancel')
                      : t('athletes:details.new_status')}
                  </Button>
                </div>
              </div>

              {isEditingCompetitorStatus && athlete.competitorStatus ? (
                <Form {...updateCompetitorStatusForm}>
                  <form
                    onSubmit={updateCompetitorStatusForm.handleSubmit(
                      onUpdateCompetitorStatus
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={updateCompetitorStatusForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('athletes:details.level')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as CompetitorLevel)
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue
                                  placeholder={t(
                                    'athletes:details.select_level'
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(CompetitorLevel).map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={updateCompetitorStatusForm.control}
                      name="sexCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('athletes:details.sex')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as SexCategory)
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue
                                  placeholder={t('athletes:details.select_sex')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(SexCategory).map((sex) => (
                                  <SelectItem key={sex} value={sex}>
                                    {sex}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={updateCompetitorStatusForm.control}
                      name="weightCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('athletes:details.weight_category')}
                          </FormLabel>
                          <FormControl className="bg-white">
                            <Input
                              type="number"
                              placeholder={t(
                                'athletes:details.weight_category'
                              )}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingCompetitorStatus(false)}
                      >
                        {t('athletes:details.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {t('athletes:details.edit')}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : isCreatingCompetitorStatus ? (
                <Form {...createCompetitorStatusForm}>
                  <form
                    onSubmit={createCompetitorStatusForm.handleSubmit(
                      onCreateCompetitorStatus
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={createCompetitorStatusForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('athletes:details.level')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as CompetitorLevel)
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue
                                  placeholder={t(
                                    'athletes:details.select_level'
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(CompetitorLevel).map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createCompetitorStatusForm.control}
                      name="sexCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('athletes:details.sex')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as SexCategory)
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue
                                  placeholder={t('athletes:details.select_sex')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(SexCategory).map((sex) => (
                                  <SelectItem key={sex} value={sex}>
                                    {sex}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createCompetitorStatusForm.control}
                      name="weightCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('athletes:details.weight_category')}
                          </FormLabel>
                          <FormControl className="bg-white">
                            <Input
                              type="number"
                              placeholder={t(
                                'athletes:details.weight_category'
                              )}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingCompetitorStatus(false)}
                      >
                        {t('athletes:details.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {t('athletes:details.create_new_status')}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : athlete.competitorStatus ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.level')}:{' '}
                    {athlete.competitorStatus.level ?? '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.sex')}:{' '}
                    {athlete.competitorStatus.sexCategory ?? '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.weight_category')}:{' '}
                    {athlete.competitorStatus.weightCategory ?? '-'} kg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('athletes:details.current_weight')}:{' '}
                    {athlete.metrics?.weight ?? '-'} kg
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t('athletes:details.no_competitor_status')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold mb-4">
            {t('athletes:details.training_history')}
          </h2>
          <div className="text-sm text-muted-foreground">
            {t('athletes:details.no_training')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
