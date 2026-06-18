# Onboarding

Onboarding covers entry points that are not regular authenticated app actions.

## Scope

- Coach access request from the public `/signup` form.
- Invitation acceptance from the public accept-invitation link.
- Invitation creation is handled by [InvitationsModule](../invitations/README.md).

## Coach Access Request

```mermaid
flowchart TD
  A["Coach candidate<br/>/signup"] --> B[Web signup form]
  B --> C[api.onboarding.requestCoachAccess]
  C --> D[OnboardingController]
  D --> E[OnboardingUseCases.createCoachAccessRequest]
  E --> F[NotificationUseCase.sendRequestAccess]
  F --> G[Email to super admin]
```

No user account or better-auth session is created by this flow.

## Accept Invitation

```mermaid
flowchart TD
  A["Invited user<br/>/accept-invitation/:id"] --> B[Web accept invitation route]
  B --> C[api.onboarding.acceptInvitation]
  C --> D[OnboardingController]
  D --> E[OnboardingUseCases.acceptInvitation]
  E --> F[Load invitation]
  F --> G{Pending and not expired?}
  G -- no --> H[Return invitation error]
  G -- yes --> I[Find user by invitation.email]
  I --> J{User exists?}
  J -- no --> K[Return user missing error]
  J -- yes --> L[Remove existing member if any]
  L --> M[Create member in invitation organization]
  M --> N[Mark invitation accepted]
  N --> O[Web redirects to download app]
```

## Related

- [Auth README](./README.md) — better-auth, guards, sessions.
- [Invitations README](../invitations/README.md) — coach/admin invitation creation.
- [Notification README](../notification/README.md) — email delivery.
