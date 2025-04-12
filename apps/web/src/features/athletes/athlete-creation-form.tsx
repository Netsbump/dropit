import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { CreateAthlete, createAthleteSchema } from '@dropit/schemas';
import { api } from '@/lib/api';
import { toast } from '@/shared/hooks/use-toast';



type AthleteCreationFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

// Mock country data - in a real app, this would come from an API
const countries = [
  { value: 'fr', label: 'France' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
];

export function AthleteCreationForm({
  onSuccess,
  onCancel,
}: AthleteCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(['athletes']);

  const { mutate: createAthleteMutation } = useMutation({
    mutationFn: async (data : CreateAthlete) => {
      const response = await api.athlete.createAthlete({ body: data });
      if (response.status !== 201) {
        throw new Error('Failed to create athlete');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Athlete created successfully',
        description: 'The athlete has been created successfully',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create athlete',
        description: error.message,
      });
    },
  });

  const formAthleteSchema = createAthleteSchema;
  const form = useForm<z.infer<typeof formAthleteSchema>>({
    resolver: zodResolver(formAthleteSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthday: '',
      country: '',
    },
  });

  const [openCountryPopover, setOpenCountryPopover] = useState(false);

  async function onSubmit(values: z.infer<typeof formAthleteSchema>) {
    try {
      setIsLoading(true);

      try {
        createAthleteMutation(values);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to create athlete:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                {t('form.first_name')} <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t('form.first_name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                {t('form.last_name')} <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t('form.last_name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex">
                {t('form.birthday')} <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={typeof field.value === 'string' ? field.value : field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.country')}</FormLabel>
              <FormControl>
                <Popover open={openCountryPopover} onOpenChange={setOpenCountryPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCountryPopover}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? countries.find((country) => country.value === field.value)?.label
                        : t('form.country_placeholder')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('form.country_search')} />
                      <CommandList>
                        <CommandEmpty>{t('form.no_country_found')}</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country.value}
                              value={country.value}
                              onSelect={(value) => {
                                form.setValue('country', value);
                                setOpenCountryPopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === country.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('form.button_cancel')}
          </Button>
          <Button type="submit">{t('form.button_create')}</Button>
        </div>
      </form>
    </Form>
  );
} 