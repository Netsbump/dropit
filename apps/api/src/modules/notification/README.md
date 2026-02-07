# Notification Module

Handles sending notifications (email, SMS, push) following hexagonal architecture.

## Structure

```
notification/
├── application/
│   ├── ports/
│   │   ├── inbound/                  # What other modules call
│   │   │   └── notification-use-cases.port.ts
│   │   └── outbound/                 # What use cases depend on
│   │       └── notification.port.ts  # NotificationRequest, KIND, INotificationPort
│   ├── use-cases/
│   │   └── notification.use-cases.ts # Business logic (sendInvitation, sendOtp)
│   └── exceptions/
│       └── notification.exceptions.ts # Business errors (UserNotFound, etc.)
├── infrastructure/
│   ├── notification.adapter.ts       # Routes NotificationRequest to the right channel
│   ├── notification.types.ts         # Transport type (email | sms | push)
│   ├── exceptions/
│   │   └── infrastructure.exceptions.ts # Technical errors (SendFailed, NotConfigured)
│   └── channels/
│       ├── email/
│       │   ├── email-channel.port.ts # IEmailChannel, IEmailTransport, EmailData
│       │   ├── email.adapter.ts      # Template rendering + transport selection
│       │   ├── brevo.adapter.ts      # Production transport (Brevo API)
│       │   └── maildev.adapter.ts    # Development transport (local SMTP)
│       ├── sms/
│       │   ├── sms-channel.port.ts   # ISmsChannel
│       │   ├── sms.adapter.ts        # Not implemented yet
│       │   └── twilio.adapter.ts     # Future: Twilio
│       └── push/
│           ├── push-channel.port.ts  # IPushChannel
│           ├── push.adapter.ts       # Not implemented yet
│           └── firebase.adapter.ts   # Future: Firebase
└── notification.module.ts            # NestJS module wiring
```

## Example: sending an organization invitation

A coach invites an athlete from the backoffice. The frontend calls the
better-auth `/api/auth/organization/invite-member` route.

```
1. Better-auth (organization plugin)
   │  Handles the HTTP request, validates the invitation,
   │  persists it in the database, then fires the
   │  afterCreateInvitation hook provided by the plugin.
   ▼
2. BetterAuthAdapter (afterCreateInvitation callback)
   │  Bridges better-auth into our application layer.
   │  Extracts organization, inviter and invitation data
   │  and calls INotificationUseCases.sendInvitation().
   ▼
3. NotificationUseCase.sendInvitation()
   │  Business logic: checks if the invited email belongs
   │  to an existing user (existing vs new user recipient).
   │  Builds a NotificationRequest { kind: ORGANIZATION_INVITATION }.
   ▼
4. NotificationAdapter.send(request)
   │  Determines the transport channel via resolveChannel()
   │  (currently defaults to email).
   ▼
5. EmailAdapter.send(request)
   │  Renders the invitation HTML template from the request
   │  and produces an EmailData { to, subject, htmlContent }.
   │  Delegates to the right transport based on environment:
   ├── production → BrevoAdapter.send(emailData)   [Brevo API]
   └── development → MaildevAdapter.send(emailData) [local SMTP]
```

## Dependency injection

The module declares **what** to wire. At startup, NestJS reads the `providers`
list in `notification.module.ts`, resolves all dependencies, and creates a
single instance (singleton) for each one.

When NestJS sees a constructor, it tries to figure out what to inject for each
parameter. How it does this depends on what the parameter type is:

```typescript
// EmailAdapter asks for BrevoAdapter directly.
// NestJS sees the class name and knows exactly what to create — no help needed.
constructor(private readonly brevoAdapter: BrevoAdapter) {}

// NotificationAdapter asks for IEmailChannel, which is an interface.
// Interfaces disappear after TypeScript compiles to JavaScript,
// so NestJS has no way to know what class to use.
// We use @Inject with a Symbol token to tell it explicitly:
// "for this parameter, use whatever is registered as EMAIL_CHANNEL_PORT"
constructor(@Inject(EMAIL_CHANNEL_PORT) private readonly emailChannel: IEmailChannel) {}
```

In the module, the link is made here:
```typescript
{ provide: EMAIL_CHANNEL_PORT, useClass: EmailAdapter }
// → "when someone asks for EMAIL_CHANNEL_PORT, give them an EmailAdapter"
```

### Keeping use cases framework-agnostic

Use cases are plain TypeScript classes with no `@Injectable()` or `@Inject()`.
The module wires them via `useFactory`:

```typescript
{
  provide: NOTIFICATION_USE_CASES,
  useFactory: (notificationPort: INotificationPort, userRepository: IUserRepository) =>
    new NotificationUseCase(notificationPort, userRepository),
  inject: [NOTIFICATION_PORT, USER_REPO],
}
```

The class itself doesn't know NestJS exists — only the module does.

### Infrastructure adapters use NestJS decorators

Adapters (`NotificationAdapter`, `BrevoAdapter`, etc.) use `@Injectable()`
and `@Inject()`. That's expected — they are the framework-facing layer.

### In short

- **application/** — no NestJS decorators (plain classes, wired by the module)
- **infrastructure/** — `@Injectable()` / `@Inject()` as needed

## Adding a new notification kind

1. Add a new variant to `NotificationRequest` in `notification.port.ts`
2. Handle it in the use case (`notification.use-cases.ts`)
3. Update `resolveChannel()` in `notification.adapter.ts` if needed
4. Add rendering logic in the relevant channel adapter (e.g. `email.adapter.ts`, `sms.adapter.ts`)
