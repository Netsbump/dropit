import { EntityManager } from '@mikro-orm/core';
import { Organization, Member } from '../modules/members/organization/organization.entity';
import { User } from '../modules/members/auth/auth.entity';

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
  organization.name = 'Halterophilie Club';
  organization.slug = 'halterophilie-club';
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
  coachMember.role = 'owner'; 

  await em.persistAndFlush(coachMember);
  console.log('Coach added as owner to organization');
  console.log('Coach user ID:', coachUser.id);
  console.log('Coach member role:', coachMember.role);

  // Ajouter les athlètes comme membres de l'organisation
  const athletes = await em.find(User, { isSuperAdmin: false, email: { $ne: 'coach@example.com' } });
  for (const athlete of athletes) {
    const athleteMember = new Member();
    athleteMember.user = athlete;
    athleteMember.organization = organization;
    athleteMember.role = 'member';
    await em.persistAndFlush(athleteMember);
    console.log('Athlete added as member to organization');
  }

  console.log('Organization seeding completed');
  console.log('Organization ID:', organization.id);


  return { organization, coachMember };
} 