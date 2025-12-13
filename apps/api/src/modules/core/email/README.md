# Module Email

Service d'envoi d'emails avec switch automatique entre développement (Maildev) et production (Brevo).

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      AuthService                             │
│  (better-auth callbacks: sendResetPassword, etc.)            │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ appelle
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    EmailService                              │
│  • sendEmail(data)           ← Méthode générique             │
│  • sendInvitationEmail(data) ← Logique métier + template     │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ utilise (via injection)
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   IEmailService                              │
│  Interface: sendEmail(to, subject, htmlContent)              │
└───────────────────────┬──────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  DevMailService  │          │   BrevoService   │
│  (Maildev SMTP)  │          │  (Brevo API)     │
│   Development    │          │   Production     │
└──────────────────┘          └──────────────────┘
```

## Flux d'appel - Exemple d'invitation

```
1. AuthService.sendInvitationEmail(callback)
       │
       └──> 2. EmailService.sendInvitationEmail(data)
                   │
                   ├──> Génère le HTML (template)
                   │
                   └──> 3. EmailService.sendEmail({ to, subject, content })
                              │
                              └──> 4. emailTransport.sendEmail(to, subject, content)
                                         │
                                         ├──> [DEV]  DevMailService → Maildev SMTP
                                         └──> [PROD] BrevoService → Brevo API
```

## Configuration

### Développement (Maildev)
```bash
# .env
NODE_ENV=development
MAILDEV_HOST=localhost
MAILDEV_SMTP_PORT=1025
MAILDEV_WEB_PORT=1080
```

Démarrer Maildev : `docker-compose up maildev`
Interface web : http://localhost:1080

### Production (Brevo)
```bash
# .env
NODE_ENV=production
BREVO_API_KEY=votre_clé_api
BREVO_FROM_EMAIL=noreply@dropit.com
BREVO_FROM_NAME=DropIt
```

## Fichiers

| Fichier | Rôle |
|---------|------|
| `email.port.ts` | Interface `IEmailService` + token d'injection |
| `email.service.ts` | Service métier avec logique et templates |
| `brevo.service.ts` | Implémentation Brevo (production) |
| `dev-mail.service.ts` | Implémentation Maildev (développement) |
| `email.module.ts` | Factory qui choisit le bon service selon `NODE_ENV` |

## Switch automatique

Le module switch automatiquement selon `NODE_ENV` :
- **development** → `DevMailService` (Maildev)
- **production** → `BrevoService` (Brevo)

Voir `email.module.ts:11-21` pour la logique de switch.
