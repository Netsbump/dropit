import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Mail, FileText, Shield, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

export const Route = createFileRoute('/__home/help')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(['common', 'privacy', 'auth']);
  const { setPageMeta } = usePageMeta();
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  useEffect(() => {
    setPageMeta({ title: t('help.title') });
  }, [setPageMeta, t]);

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="container p-4 w-full">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t('help.title')}</h1>
            <p className="text-muted-foreground">{t('help.description')}</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Section */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>{t('help.contact.title')}</CardTitle>
              </div>
              <CardDescription>{t('help.contact.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('help.contact.email.label')}
                </p>
                <p className="text-lg font-semibold">{t('help.contact.email.value')}</p>
                <Button asChild className="w-full mt-2">
                  <a href={`mailto:${t('help.contact.email.value')}`}>
                    {t('help.contact.email.action')}
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {t('help.contact.response_time')}
              </p>
            </CardContent>
          </Card>

          {/* Legal Documents Section */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>{t('help.legal.title')}</CardTitle>
              </div>
              <CardDescription>{t('help.legal.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold">{t('help.legal.privacy.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('help.legal.privacy.description')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPrivacyDialogOpen(true)}
                  >
                    {t('help.legal.privacy.action')}
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold">{t('help.legal.terms.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('help.legal.terms.description')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setTermsDialogOpen(true)}
                  >
                    {t('help.legal.terms.action')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>{t('help.faq.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account">
                <AccordionTrigger>{t('help.faq.items.account.question')}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('help.faq.items.account.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="athlete">
                <AccordionTrigger>{t('help.faq.items.athlete.question')}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('help.faq.items.athlete.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data">
                <AccordionTrigger>{t('help.faq.items.data.question')}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('help.faq.items.data.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger>{t('help.faq.items.support.question')}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('help.faq.items.support.answer')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Privacy Policy Dialog */}
        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('help.dialogs.privacy.title')}</DialogTitle>
            </DialogHeader>
            <PrivacyContent />
          </DialogContent>
        </Dialog>

        {/* Terms Dialog */}
        <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('help.dialogs.terms.title')}</DialogTitle>
            </DialogHeader>
            <TermsContent />
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </ScrollArea>
  );
}

// Privacy Policy Content Component
function PrivacyContent() {
  const { t } = useTranslation(['privacy']);

  type ProcessingPurpose = {
    purpose: string;
    data: string;
    reason: string;
  };

  type GdprRight = {
    name: string;
    description: string;
    howTo: string;
  };

  return (
    <div className="space-y-6 text-sm">
      <p className="text-muted-foreground">{t('lastUpdated')}</p>
      <p>{t('introduction')}</p>

      {/* Data Controller */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('sections.responsable.title')}</h3>
        <p>{t('sections.responsable.content')}</p>
        <div className="bg-muted p-3 rounded-md space-y-1">
          <p className="font-semibold">{t('sections.responsable.name')}</p>
          <p>{t('sections.responsable.email')}</p>
        </div>
      </div>

      {/* Personal Data Collected */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('sections.donneesCollectees.title')}</h3>
        <p>{t('sections.donneesCollectees.intro')}</p>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold">
              {t('sections.donneesCollectees.categories.compte.title')}
            </h4>
            <ul className="list-disc pl-6">
              {(
                t('sections.donneesCollectees.categories.compte.items', {
                  returnObjects: true,
                }) as string[]
              ).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Processing Purposes */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('sections.finalites.title')}</h3>
        <div className="space-y-2">
          {(
            t('sections.finalites.items', { returnObjects: true }) as ProcessingPurpose[]
          ).map((item) => (
            <div key={item.purpose} className="bg-muted p-2 rounded-md">
              <p className="font-semibold">{item.purpose}</p>
              <p className="text-xs text-muted-foreground">Données: {item.data}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GDPR Rights */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('sections.droits.title')}</h3>
        <p>{t('sections.droits.intro')}</p>
        <div className="space-y-2">
          {(t('sections.droits.rights', { returnObjects: true }) as GdprRight[]).map((right) => (
            <div key={right.name} className="bg-muted p-2 rounded-md">
              <p className="font-semibold">{right.name}</p>
              <p className="text-xs">{right.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-primary/10 p-4 rounded-md space-y-2">
        <h3 className="font-semibold">{t('contact.title')}</h3>
        <p>{t('contact.description')}</p>
        <p className="font-semibold">{t('contact.email')}</p>
      </div>
    </div>
  );
}

// Terms Content Component
function TermsContent() {
  const { t } = useTranslation(['auth']);

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{t('terms.lastUpdated')}</p>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('terms.sections.introduction.title')}
          </h3>
          <p>{t('terms.sections.introduction.description')}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('terms.sections.usingOurService.title')}
          </h3>
          <p>{t('terms.sections.usingOurService.description')}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('terms.sections.yourAccount.title')}</h3>
          <p>{t('terms.sections.yourAccount.description')}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('terms.sections.privacyAndCopyright.title')}
          </h3>
          <p>{t('terms.sections.privacyAndCopyright.description')}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('terms.sections.modifyingAndTerminating.title')}
          </h3>
          <p>{t('terms.sections.modifyingAndTerminating.description')}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('terms.sections.warrantiesAndDisclaimers.title')}
          </h3>
          <p>{t('terms.sections.warrantiesAndDisclaimers.description')}</p>
        </div>
      </div>
    </div>
  );
}
