import { EntityManager } from '@mikro-orm/core';
import { Organization, Member } from '../modules/members/organization/organization.entity';
import { User, Session } from '../modules/members/auth/auth.entity';

export async function seedOrganizations(
  em: EntityManager
): Promise<{ organization: Organization; coachMember: Member }> {
  console.log('Seeding organizations...');

  // Vérifier si une organisation existe déjà
  const existingOrganization = await em.findOne(Organization, { name: 'DropIt Coaching' });

  if (existingOrganization) {
    console.log('Organization already exists, using existing one');
    
    // Récupérer le coach existant
    const coachUser = await em.findOne(User, { email: 'coach@example.com' });
    if (!coachUser) {
      throw new Error('Coach user not found. Please run seedAthletes first.');
    }

    // Vérifier si le coach est déjà membre de l'organisation
    const existingMember = await em.findOne(Member, {
      user: { id: coachUser.id },
      organization: { id: existingOrganization.id },
    });

    if (existingMember) {
      console.log('Coach is already a member of the organization');
      return { organization: existingOrganization, coachMember: existingMember };
    }

    // Ajouter le coach comme membre de l'organisation
    const coachMember = new Member();
    coachMember.user = coachUser;
    coachMember.organization = existingOrganization;
    coachMember.role = 'owner'; // Le coach devient owner de l'organisation

    await em.persistAndFlush(coachMember);
    console.log('Coach added as owner to existing organization');

    return { organization: existingOrganization, coachMember };
  }

  // Créer une nouvelle organisation
  const organization = new Organization();
  organization.name = 'DropIt Coaching';
  organization.slug = 'dropit-coaching';
  organization.metadata = JSON.stringify({
    description: 'Organisation de coaching pour la gestion des athlètes et des programmes d\'entraînement',
    type: 'coaching',
    createdAt: new Date().toISOString(),
  });

  await em.persistAndFlush(organization);
  console.log('Created new organization:', organization.name);

  // Récupérer le coach existant
  const coachUser = await em.findOne(User, { email: 'coach@example.com' });
  if (!coachUser) {
    throw new Error('Coach user not found. Please run seedAthletes first.');
  }

  // Ajouter le coach comme membre de l'organisation (owner)
  const coachMember = new Member();
  coachMember.user = coachUser;
  coachMember.organization = organization;
  coachMember.role = 'owner'; // Le coach devient owner de l'organisation

  await em.persistAndFlush(coachMember);
  console.log('Coach added as owner to organization');

  // Mettre à jour la session du coach pour définir l'organisation active
  // Better Auth gère automatiquement l'activeOrganizationId dans la session
  // mais nous devons nous assurer que l'utilisateur a une organisation active
  console.log('Organization seeding completed');
  console.log('Coach user ID:', coachUser.id);
  console.log('Organization ID:', organization.id);
  console.log('Coach member role:', coachMember.role);

  // Mettre à jour la session active pour définir l'organisation active
  // Note: Better Auth gère automatiquement cela, mais nous pouvons forcer la mise à jour
  const activeSession = await em.findOne(Session, { 
    user: { id: coachUser.id },
    expiresAt: { $gt: new Date() }
  });

  if (activeSession) {
    activeSession.activeOrganizationId = organization.id;
    await em.persistAndFlush(activeSession);
    console.log('Updated active session with organization ID:', organization.id);
  } else {
    console.log('No active session found for coach, will be set on next login');
  }

  return { organization, coachMember };
} 