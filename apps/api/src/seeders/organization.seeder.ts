import { EntityManager } from '@mikro-orm/core';
import { Organization } from '../modules/auth/domain/organization/organization.entity';
import { Member } from '../modules/auth/domain/organization/member.entity';
import { User } from '../modules/auth/domain/auth/user.entity';

export async function seedOrganizations(
  em: EntityManager
): Promise<{ organization: Organization; coachMember: Member }> {
  console.log('Seeding organizations...');

  // Check if an organization already exists
  const existingOrganization = await em.findOne(Organization, { name: 'DropIt Coaching' });

  if (existingOrganization) {
    console.log('Organization already exists, using existing one');
    
    // Get the existing coach
    const coachUser = await em.findOne(User, { email: 'coach@example.com' });
    if (!coachUser) {
      throw new Error('Coach user not found. Please run seedAthletes first.');
    }

    // Check if the coach is already a member of the organization
    const existingMember = await em.findOne(Member, {
      user: { id: coachUser.id },
      organization: { id: existingOrganization.id },
    });

    if (existingMember) {
      console.log('Coach is already a member of the organization');
      return { organization: existingOrganization, coachMember: existingMember };
    }

    // Add the coach as a member of the organization
    const coachMember = new Member();
    coachMember.user = coachUser;
    coachMember.organization = existingOrganization;
    coachMember.role = 'admin';

    await em.persistAndFlush(coachMember);
    console.log('Coach added as admin to existing organization');

    return { organization: existingOrganization, coachMember };
  }

  // Create a new organization
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

  // Owner = creator of the organization and admin (app-level admin)
  const superAdmin = await em.findOne(User, { email: 'super.admin@gmail.com' });
  if (!superAdmin) {
    throw new Error('Super admin user not found. Please run seedAthletes first.');
  }
  const ownerMember = new Member();
  ownerMember.user = superAdmin;
  ownerMember.organization = organization;
  ownerMember.role = 'owner';
  await em.persistAndFlush(ownerMember);
  console.log('Super admin added as owner (creator) of organization');

  // Coach = admin of the organization, remains "user" in the app
  const coachUser = await em.findOne(User, { email: 'coach@example.com' });
  if (!coachUser) {
    throw new Error('Coach user not found. Please run seedAthletes first.');
  }
  const coachMember = new Member();
  coachMember.user = coachUser;
  coachMember.organization = organization;
  coachMember.role = 'admin';
  await em.persistAndFlush(coachMember);
  console.log('Coach added as admin to organization');
  console.log('Coach user ID:', coachUser.id);
  console.log('Coach member role:', coachMember.role);

  // Add athletes as members of the organization
  const athletes = await em.find(User, {
    $or: [{ role: { $ne: 'admin' } }, { role: null }],
    email: { $ne: 'coach@example.com' },
  });
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