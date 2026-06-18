# Invitations Module

Owns invitation orchestration. Existing HTTP routes stay in their current controllers for now.

## Responsibilities

- Prepare invited recipients (`User` + `Athlete` profile when needed).
- Delegate invitation creation to better-auth through `InvitationAuthProvider`.
- Provide recipient context to the better-auth notification hook.
- Keep route-specific authorization inputs explicit via `InvitationActor`.

## Coach Invites Athlete

```mermaid
flowchart TD
  A["AthleteController<br/>POST /athlete/invitations"] --> B[InvitationUseCases.inviteAthlete]
  B --> C[InvitationRecipientService.prepareRecipient]
  C --> D{User exists?}
  D -- no --> E[UserUseCases.create]
  E --> F[AthleteRepository.save]
  D -- yes --> G[Check member/org context]
  F --> H[BetterAuthInvitationProviderAdapter]
  G --> H
  H --> I[BetterAuthAdapter.api.createInvitation\nrole: member]
  I --> J[better-auth organization plugin]
  J --> K[afterCreateInvitation]
  K --> L[InvitationRecipientService.getNotificationContext]
  L --> M[NotificationUseCase.sendOrganizationInvitation]
```

```mermaid
sequenceDiagram
  participant Coach
  participant Web
  participant API as AthleteController
  participant Invite as InvitationUseCases
  participant Recipient as InvitationRecipientService
  participant BA as BetterAuthAdapter
  participant Notif as NotificationUseCase

  Coach->>Web: Submit athlete invitation form
  Web->>API: POST /athlete/invitations
  API->>Invite: inviteAthlete(input, actor)
  Invite->>Recipient: prepareRecipient(email, organizationId, profile)
  Recipient->>Recipient: Ensure User + Athlete when needed
  Invite->>BA: api.createInvitation(role: member)
  BA->>BA: better-auth creates invitation
  BA->>Recipient: getNotificationContext(email, organizationId)
  BA->>Notif: sendOrganizationInvitation(...)
```

## Super Admin Invites User

```mermaid
flowchart TD
  A["AdminController<br/>POST /admin/invitations"] --> B[InvitationUseCases.inviteUser]
  B --> C[Validate actor is super admin]
  C --> D[InvitationRecipientService.prepareRecipient]
  D --> E{User exists?}
  E -- no --> F[UserUseCases.create]
  F --> G[AthleteRepository.save]
  E -- yes --> H[Check member/org context]
  G --> I[BetterAuthInvitationProviderAdapter]
  H --> I
  I --> J[BetterAuthAdapter.api.createInvitation\nrole: input member/admin]
  J --> K[better-auth organization plugin]
  K --> L[afterCreateInvitation]
  L --> M[InvitationRecipientService.getNotificationContext]
  M --> N[NotificationUseCase.sendOrganizationInvitation]
```

```mermaid
sequenceDiagram
  participant Admin as Super admin
  participant Web
  participant API as AdminController
  participant Invite as InvitationUseCases
  participant Recipient as InvitationRecipientService
  participant BA as BetterAuthAdapter
  participant Notif as NotificationUseCase

  Admin->>Web: Submit admin invitation form
  Web->>API: POST /admin/invitations
  API->>Invite: inviteUser(input, actor)
  Invite->>Invite: Validate super admin actor
  Invite->>Recipient: prepareRecipient(email, organizationId, profile)
  Recipient->>Recipient: Ensure User + Athlete when needed
  Invite->>BA: api.createInvitation(role: member/admin)
  BA->>BA: better-auth creates invitation
  BA->>Recipient: getNotificationContext(email, organizationId)
  BA->>Notif: sendOrganizationInvitation(...)
```

## Module Relations

```mermaid
flowchart LR
  A[AdminController] --> C[InvitationUseCases]
  B[AthleteController] --> C

  C --> D[InvitationRecipientService]
  D --> E[UserUseCases]
  D --> F[AthleteRepository]
  D --> G[MemberRepository]

  C --> H[InvitationAuthProvider]
  H --> I[BetterAuthAdapter]
  I --> J[better-auth]

  J --> K[afterCreateInvitation]
  K --> D
  K --> L[NotificationUseCase]
```

## Current Boundaries

```mermaid
flowchart TD
  A[prepareRecipient] --> B[User save]
  B --> C[Athlete save]
  C --> D[better-auth createInvitation]
  D --> E[afterCreateInvitation]
  E --> F[notification best-effort]

  B -. separate flush .-> C
  C -. not one transaction with better-auth .-> D
  F -. errors logged, no rollback .-> G[Invitation remains created]
```

## Notes

- No `InvitationController` yet.
- Route paths and frontend calls are unchanged.
- `acceptInvitation` still lives in onboarding for now.
- Notification still starts from better-auth `afterCreateInvitation`.
