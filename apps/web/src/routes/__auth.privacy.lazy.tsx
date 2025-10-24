import { createLazyFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '../shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card';
import { useTranslation } from '@dropit/i18n';

// Privacy Policy Types
type ProcessingPurpose = {
  purpose: string;
  data: string;
  reason: string;
};

type LegalBasis = {
  type: string;
  description: string;
  examples: string[];
};

type RetentionDuration = {
  category: string;
  duration: string;
  details: string;
};

type GdprRight = {
  name: string;
  description: string;
  howTo: string;
};

type Infrastructure = {
  service: string;
  provider: string;
  location: string;
  details: string;
};

type CookieType = {
  name: string;
  cookie: string;
  purpose: string;
  duration: string;
  type: string;
  security: string;
};

type SecurityMeasure = {
  category: string;
  measures: string[];
};

export const Route = createLazyFileRoute('/__auth/privacy')({
  component: Privacy,
});

function Privacy() {
  const { t } = useTranslation(['privacy']);

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
        </div>

        {/* Introduction */}
        <p className="text-lg">{t('introduction')}</p>

        {/* 1. Data Controller */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.responsable.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{t('sections.responsable.content')}</p>
            <div className="bg-muted p-4 rounded-md space-y-1">
              <p className="font-semibold">{t('sections.responsable.name')}</p>
              <p>{t('sections.responsable.email')}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t('sections.responsable.note')}</p>
            <p className="text-sm">{t('sections.responsable.contact')}</p>
          </CardContent>
        </Card>

        {/* 2. Personal Data Collected */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.donneesCollectees.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.donneesCollectees.intro')}</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('sections.donneesCollectees.categories.compte.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {(t('sections.donneesCollectees.categories.compte.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('sections.donneesCollectees.categories.athlete.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {(t('sections.donneesCollectees.categories.athlete.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('sections.donneesCollectees.categories.performance.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {(t('sections.donneesCollectees.categories.performance.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('sections.donneesCollectees.categories.technique.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {(t('sections.donneesCollectees.categories.technique.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('sections.donneesCollectees.categories.organisation.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {(t('sections.donneesCollectees.categories.organisation.items', { returnObjects: true }) as string[]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Processing Purposes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.finalites.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.finalites.intro')}</p>
            <div className="space-y-3">
              {(t('sections.finalites.items', { returnObjects: true }) as ProcessingPurpose[]).map((item) => (
                <div key={item.purpose} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{item.purpose}</p>
                  <p className="text-sm text-muted-foreground">Données: {item.data}</p>
                  <p className="text-sm">{item.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Legal Basis */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.baseLegale.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.baseLegale.intro')}</p>
            <div className="space-y-3">
              {(t('sections.baseLegale.bases', { returnObjects: true }) as LegalBasis[]).map((basis) => (
                <div key={basis.type} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{basis.type}</p>
                  <p className="text-sm mb-2">{basis.description}</p>
                  <ul className="list-disc pl-6 text-sm">
                    {basis.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.conservation.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.conservation.intro')}</p>
            <div className="space-y-3">
              {(t('sections.conservation.durations', { returnObjects: true }) as RetentionDuration[]).map((duration) => (
                <div key={duration.category} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{duration.category}</p>
                  <p className="text-sm text-muted-foreground">{duration.duration}</p>
                  <p className="text-sm">{duration.details}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">{t('sections.conservation.note')}</p>
          </CardContent>
        </Card>

        {/* 6. GDPR Rights */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.droits.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.droits.intro')}</p>
            <div className="space-y-3">
              {(t('sections.droits.rights', { returnObjects: true }) as GdprRight[]).map((right) => (
                <div key={right.name} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{right.name}</p>
                  <p className="text-sm mb-1">{right.description}</p>
                  <p className="text-sm text-primary">→ {right.howTo}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="font-semibold mb-2">{t('sections.droits.exercice.title')}</p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {(t('sections.droits.exercice.methods', { returnObjects: true }) as string[]).map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 7. Data Location and Hosting */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.localisation.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.localisation.intro')}</p>
            <div className="space-y-3">
              {(t('sections.localisation.infrastructure', { returnObjects: true }) as Infrastructure[]).map((infra) => (
                <div key={infra.service} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{infra.service}</p>
                  <p className="text-sm">Fournisseur: {infra.provider}</p>
                  <p className="text-sm">Localisation: {infra.location}</p>
                  <p className="text-sm text-muted-foreground">{infra.details}</p>
                </div>
              ))}
            </div>
            <p className="font-semibold text-green-600">{t('sections.localisation.transfert')}</p>

            <div className="space-y-2">
              <p className="font-semibold">{t('sections.localisation.soustraitants.title')}</p>
              <p className="text-sm">{t('sections.localisation.soustraitants.intro')}</p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {(t('sections.localisation.soustraitants.list', { returnObjects: true }) as string[]).map((subcontractor) => (
                  <li key={subcontractor}>{subcontractor}</li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-primary">{t('sections.localisation.soustraitants.engagement')}</p>
              <p className="text-sm">{t('sections.localisation.soustraitants.partage')}</p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {(t('sections.localisation.soustraitants.conditions', { returnObjects: true }) as string[]).map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 8. Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.cookies.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.cookies.intro')}</p>
            <div className="space-y-3">
              {(t('sections.cookies.types', { returnObjects: true }) as CookieType[]).map((cookie) => (
                <div key={cookie.cookie} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold">{cookie.name}</p>
                  <p className="text-sm font-mono text-muted-foreground">{cookie.cookie}</p>
                  <p className="text-sm">Finalité: {cookie.purpose}</p>
                  <p className="text-sm">Durée: {cookie.duration}</p>
                  <p className="text-sm">{cookie.type}</p>
                  <p className="text-sm text-muted-foreground">Sécurité: {cookie.security}</p>
                </div>
              ))}
            </div>
            <p className="text-sm">{t('sections.cookies.analytics')}</p>
            <p className="text-sm text-muted-foreground">{t('sections.cookies.gestion')}</p>
          </CardContent>
        </Card>

        {/* 9. Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.securite.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.securite.intro')}</p>
            <div className="space-y-3">
              {(t('sections.securite.mesures', { returnObjects: true }) as SecurityMeasure[]).map((measure) => (
                <div key={measure.category} className="bg-muted p-3 rounded-md">
                  <p className="font-semibold mb-2">{measure.category}</p>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    {measure.measures.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-orange-600">{t('sections.securite.incident')}</p>
          </CardContent>
        </Card>

        {/* 10. Minors */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.mineur.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{t('sections.mineur.content')}</p>
            <p className="font-semibold text-orange-600">{t('sections.mineur.consentement')}</p>
            <p className="text-sm">{t('sections.mineur.responsabilite')}</p>
            <p className="text-sm text-muted-foreground">{t('sections.mineur.verification')}</p>
          </CardContent>
        </Card>

        {/* 11. Right to Lodge a Complaint */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.reclamation.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('sections.reclamation.intro')}</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="font-semibold">{t('sections.reclamation.cnil.name')}</p>
              <p className="text-sm">{t('sections.reclamation.cnil.address')}</p>
              <p className="text-sm">{t('sections.reclamation.cnil.phone')}</p>
              <p className="text-sm">
                <a href={t('sections.reclamation.cnil.website')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('sections.reclamation.cnil.website')}
                </a>
              </p>
              <p className="text-sm">
                <a href={t('sections.reclamation.cnil.plainte')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('sections.reclamation.cnil.plainte')}
                </a>
              </p>
            </div>
            <p className="text-sm">{t('sections.reclamation.autre')}</p>
            <p className="text-sm text-muted-foreground">{t('sections.reclamation.avant')}</p>
          </CardContent>
        </Card>

        {/* 12. Changes to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.modifications.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{t('sections.modifications.content')}</p>
            <p>{t('sections.modifications.notification')}</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              {(t('sections.modifications.moyens', { returnObjects: true }) as string[]).map((moyen) => (
                <li key={moyen}>{moyen}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{t('sections.modifications.date')}</p>
            <p className="text-sm">{t('sections.modifications.acceptation')}</p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{t('contact.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{t('contact.description')}</p>
            <p className="font-semibold text-lg">{t('contact.email')}</p>
            <p className="text-sm text-muted-foreground">{t('contact.delai')}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/login">{t('privacy.buttons.backToLogin', { ns: 'auth' })}</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">{t('privacy.buttons.signUp', { ns: 'auth' })}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
