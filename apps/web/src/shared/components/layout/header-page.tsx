import { useTranslation } from '@dropit/i18n';

export function HeaderPage({ title, description }: { title: string; description: string }) {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{t(title)}</h1>
            <p className="text-sm text-muted-foreground mb-6">
                {t(description)}
            </p>
        </div>
    );
}
