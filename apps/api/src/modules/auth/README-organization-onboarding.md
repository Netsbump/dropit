# Organization & Onboarding

How users create or join organizations, and how the invitation system works.

## User stories

### New user onboarding

A newly signed-up user with no organization chooses their path:

- **Create a club** — becomes a coach (owner), redirected to `/dashboard` (web backoffice)
- **Join a club** — becomes an athlete (member), redirected to `/download-app` (mobile app)

### Creating an organization

1. Coach navigates to `/create-organization`
2. Fills in club details
3. Better-auth creates the organization and assigns the `owner` role
4. Redirect to `/dashboard`

### Joining an organization

1. Athlete receives an invitation email from their coach
2. Clicks the link → `/accept-invitation/:id`
3. Signs in or signs up
4. Invitation is accepted, `member` record created
5. Redirect to `/download-app`

## Invitation flow

A coach invites an athlete from the backoffice. The entire flow is handled by better-auth's organization plugin.

```mermaid
sequenceDiagram
    participant Coach as Coach (Frontend)
    participant BA_C as Better Auth Client
    participant API as API
    participant BA_S as Better Auth Server
    participant DB as Database
    participant Notif as NotificationModule

    Coach->>BA_C: authClient.organization.inviteMember({email, role: 'member'})
    BA_C->>API: POST /auth/organization/invite-member

    API->>BA_S: Better-auth middleware handles /auth/* route
    BA_S->>DB: INSERT invitation
    DB-->>BA_S: Invitation created

    BA_S->>BA_S: Fires afterCreateInvitation hook
    BA_S->>Notif: BetterAuthAdapter calls INotificationUseCases.sendInvitation()
    Note over Notif: See notification module README for email delivery details

    BA_S-->>API: Response with invitationId
    API-->>BA_C: Response forwarded
    BA_C-->>Coach: Success → toast "Invitation sent"
```

Note: `/auth/*` routes are handled directly by better-auth middleware, not by NestJS controllers. AuthGuard and PermissionsGuard do not run for these routes.

For details on how the invitation email is rendered and sent, see the [Notification module README](../notification/README.md).

## Acceptance flow

The athlete receives the email and clicks the invitation link.

```mermaid
sequenceDiagram
    participant Athlete as Athlete
    participant F as Frontend
    participant BA_C as Better Auth Client
    participant API as API
    participant BA_S as Better Auth Server
    participant DB as Database

    Athlete->>F: Clicks invitation link → /accept-invitation/:id

    alt Already has an account
        Athlete->>F: Signs in
        F->>BA_C: authClient.signIn.email({email, password})
        BA_C->>API: POST /auth/login
        API->>BA_S: Better-auth middleware
        BA_S->>DB: Verify credentials + create session
        BA_S-->>F: Session created
    else New user
        Athlete->>F: Signs up
        F->>BA_C: authClient.signUp.email({name, email, password})
        BA_C->>API: POST /auth/signup
        API->>BA_S: Better-auth middleware
        BA_S->>DB: Create user + session
        BA_S-->>F: Session created
    end

    F->>BA_C: authClient.organization.getInvitation({id})
    BA_C->>API: GET /auth/organization/get-invitation
    API->>BA_S: Better-auth middleware
    BA_S->>DB: SELECT invitation
    BA_S-->>F: Invitation details

    F->>BA_C: authClient.organization.acceptInvitation({invitationId})
    BA_C->>API: POST /auth/organization/accept-invitation
    API->>BA_S: Better-auth middleware
    BA_S->>DB: UPDATE invitation status = 'accepted'
    BA_S->>DB: INSERT member (userId, organizationId, role: 'member')
    BA_S-->>F: Invitation accepted

    F->>F: Check user role from session
    F->>F: Redirect to /download-app (member) or /dashboard (admin/owner)
```
