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
  E --> F[IInvitationAthleteCreation.createAthleteForInvitation]
  F --> G[AthleteInvitationCreationAdapter]
  G --> H[IAthleteInvitationCreation.createFromInvitation]
  D -- yes --> I[Check member/org context]
  H --> J[BetterAuthInvitationProviderAdapter]
  I --> J
  J --> K[BetterAuthAdapter.api.createInvitation<br/>role: member]
  K --> L[better-auth organization plugin]
  L --> M[afterCreateInvitation]
  M --> N[InvitationRecipientService.getNotificationContext]
  N --> O[NotificationUseCase.sendOrganizationInvitation]
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
  F --> G[IInvitationAthleteCreation.createAthleteForInvitation]
  G --> H[AthleteInvitationCreationAdapter]
  H --> I[IAthleteInvitationCreation.createFromInvitation]
  E -- yes --> J[Check member/org context]
  I --> K[BetterAuthInvitationProviderAdapter]
  J --> K
  K --> L[BetterAuthAdapter.api.createInvitation<br/>role: input member/admin]
  L --> M[better-auth organization plugin]
  M --> N[afterCreateInvitation]
  N --> O[InvitationRecipientService.getNotificationContext]
  O --> P[NotificationUseCase.sendOrganizationInvitation]
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
  D --> F[IInvitationAthleteCreation]
  F --> G[AthleteInvitationCreationAdapter]
  G --> H[IAthleteInvitationCreation]
  D --> I[MemberRepository]

  C --> J[InvitationAuthProvider]
  J --> K[BetterAuthAdapter]
  K --> L[better-auth]

  L --> M[afterCreateInvitation]
  M --> D
  M --> N[NotificationUseCase]
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
