# Notification Module

Sends notifications (email today; SMS and push wired but not fully implemented) using hexagonal architecture.

**Shared architecture notes** (Symbol tokens, `useFactory`, layer boundaries): [`docs/architecture-hexagonale.md`](../../../../../docs/architecture-hexagonale.md) — that guide is written in French.

## Overview

Notifications are centralized: callers depend on **`INotificationUseCases`** (port IN). The use case builds a **`NotificationRequest`** (discriminated by `kind`) and sends it through **`INotificationPort`**, implemented by **`NotificationAdapter`**, which picks **email**, **SMS**, or **push** via `resolveChannel()`.

**How other modules use it**  
Same pattern as elsewhere: consumers do not reach into this module’s concrete classes. They inject **`INotificationUseCases`** into **their own** application or infrastructure code—usually a use case or an adapter—and call the appropriate method from there. HTTP controllers stay thin: they call *their* use case, and only that layer (or an adapter such as **`BetterAuthAdapter`**) talks to notifications. Examples: **`BetterAuthAdapter`** invokes `sendOtp({ email, otp, type })` for better-auth’s `emailOTP` plugin and `sendOrganizationInvitation` after organization invites; **`OnboardingUseCases`** invokes `sendRequestAccess` for coach access requests. Authentication-specific wiring (clients → plugins → channels) is sketched under [**Authentication overview**](../auth/README.md#authentication-overview) in the auth module README.

**Product / roadmap**  
SMS (`phoneNumber`), push, and admin 2FA are tracked in [`docs/task-management/001-migration-otp-notifications.md`](../../../../../docs/task-management/001-migration-otp-notifications.md).

### Flow (conceptual)

```
Application / adapter entry points
(BetterAuthAdapter, OnboardingUseCases)
    ↓
INotificationUseCases
    ↓
NotificationUseCase
    ↓
INotificationPort.send(NotificationRequest)
    ↓
NotificationAdapter → EmailAdapter | SmsAdapter | PushAdapter
    ↓
Brevo / Maildev | (SMS TBD) | (Push TBD)
```

## Structure

```
notification/
├── application/
│   ├── ports/
│   │   ├── inbound/
│   │   │   └── notification-use-cases.port.ts   # INotificationUseCases
│   │   └── outbound/
│   │       └── notification.port.ts             # NotificationRequest, KIND, INotificationPort
│   ├── use-cases/
│   │   └── notification.use-cases.ts
│   └── exceptions/
│       └── notification.exceptions.ts
├── infrastructure/
│   ├── notification.adapter.ts
│   ├── notification.types.ts                    # TRANSPORT (email | sms | push)
│   ├── exceptions/
│   │   └── infrastructure.exceptions.ts
│   └── channels/
│       ├── email/
│       │   ├── email-channel.port.ts
│       │   ├── email.adapter.ts
│       │   ├── brevo.adapter.ts
│       │   └── maildev.adapter.ts
│       ├── sms/
│       │   ├── sms-channel.port.ts
│       │   ├── sms.adapter.ts                   # throws until implemented
│       │   └── twilio.adapter.ts                # placeholder / future
│       └── push/
│           ├── push-channel.port.ts
│           ├── push.adapter.ts                  # throws until implemented
│           └── firebase.adapter.ts              # placeholder / future
└── notification.module.ts
```

## Example: organization invitation email

A coach invites an athlete from the backoffice. The frontend calls better-auth  
`POST /auth/organization/invite-member`.

```
1. Better-auth (organization plugin)
   │  Persists the invitation, then runs afterCreateInvitation.
   ▼
2. BetterAuthAdapter (afterCreateInvitation)
   │  prepareUserForInvitation + INotificationUseCases.sendOrganizationInvitation()
   ▼
3. NotificationUseCase.sendOrganizationInvitation()
   │  Builds NotificationRequest { kind: ORGANIZATION_INVITATION, ... }.
   ▼
4. NotificationAdapter.send(request)
   │  resolveChannel() → email for this kind today.
   ▼
5. EmailAdapter.send(request)
   │  Renders HTML → EmailData → BrevoAdapter (prod) or MaildevAdapter (dev).
```

Onboarding flows (invitation + acceptance) are described in [`README-onboarding.md`](../auth/README-onboarding.md).

## Wiring (Nest) — specifics of this module

All bindings live in [`notification.module.ts`](notification.module.ts). Generic rules (why **Symbol** tokens, `@Inject`, `useFactory` for framework-free use-cases) are in [`docs/architecture-hexagonale.md`](../../../../../docs/architecture-hexagonale.md) (French).

**What is registered here**

| Token | Role |
|-------|------|
| `NOTIFICATION_USE_CASES` | `useFactory` → `new NotificationUseCase(notificationPort)` (use-case stays a plain class) |
| `NOTIFICATION_PORT` | `NotificationAdapter` — routes `NotificationRequest` to email / SMS / push channels |
| `EMAIL_CHANNEL_PORT` | `EmailAdapter` — builds `EmailData` from the request |
| `EMAIL_TRANSPORT` | `useFactory` — **Maildev** (non-prod) or **Brevo** (prod); throws at startup if prod is missing `BREVO_API_KEY` |
| `SMS_CHANNEL_PORT` / `PUSH_CHANNEL_PORT` | Placeholder adapters until product implements SMS/push |

**Channel vs transport (email)**  
`EmailAdapter` only knows **`IEmailTransport`**: it renders HTML and calls `transport.send()`. Choosing Maildev vs Brevo is **not** inside the adapter; it is entirely in the `EMAIL_TRANSPORT` factory in `notification.module.ts` (same idea as the environment-driven factory pattern in the hexagonal doc above).

**Minimal injection shape** (for orientation; see source for full types):

```typescript
// EmailAdapter — transport from factory
constructor(@Inject(EMAIL_TRANSPORT) private readonly transport: IEmailTransport) {}

// NotificationAdapter — one injectable per channel
constructor(
  @Inject(EMAIL_CHANNEL_PORT) private readonly emailChannel: IEmailChannel,
  @Inject(SMS_CHANNEL_PORT) private readonly smsChannel: ISmsChannel,
  @Inject(PUSH_CHANNEL_PORT) private readonly pushChannel: IPushChannel,
) {}
```

## Adding a new notification kind

1. Extend `NotificationRequest` in `notification.port.ts` (and `KIND` if needed).
2. Add a method on `INotificationUseCases` + implement it in `notification.use-cases.ts`.
3. Update `resolveChannel()` in `notification.adapter.ts` if routing changes.
4. Handle rendering in the relevant channel adapter (e.g. `email.adapter.ts`).
