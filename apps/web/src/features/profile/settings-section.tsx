import { useTranslation } from '@dropit/i18n';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useState, useEffect } from 'react';

export function SettingsSection() {
  const { t, i18n: i18nInstance } = useTranslation(['profile']);
  const [language, setLanguage] = useState(i18nInstance.language);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18nInstance.changeLanguage(value);
    // i18next-browser-languagedetector uses 'i18nextLng' as the key
    localStorage.setItem('i18nextLng', value);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    // TODO: Implement dark mode theme switching
    // This will require adding theme provider and CSS variables
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t('profile:settings.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('profile:settings.description')}</p>
      </div>
      <div className="space-y-6">
        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">{t('profile:settings.language.label')}</Label>
            <p className="text-sm text-gray-600">
              {t('profile:settings.language.description')}
            </p>
          </div>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">{t('profile:settings.dark_mode.label')}</Label>
            <p className="text-sm text-gray-600">
              {t('profile:settings.dark_mode.description')}
            </p>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={handleDarkModeChange}
            disabled
          />
        </div>
        {darkMode && (
          <p className="text-xs text-gray-500 italic">
            {t('profile:settings.dark_mode.coming_soon')}
          </p>
        )}
      </div>
    </div>
  );
}
