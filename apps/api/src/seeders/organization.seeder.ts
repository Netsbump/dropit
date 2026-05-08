import { EntityManager } from '@mikro-orm/core';
import { Organization } from '../modules/auth/domain/organization/organization.entity';
import { Member } from '../modules/auth/domain/organization/member.entity';
import { User } from '../modules/auth/domain/auth/user.entity';
import { ORGANIZATION_ROLE, type OrganizationRole } from '@dropit/schemas';

const ORG_SLUG = 'halterophilie-club';

async function ensureMember(
  em: EntityManager,
  user: User,
  organization: Organization,
  role: OrganizationRole
): Promise<Member> {
  const existing = await em.findOne(Member, { user, organization });
  if (existing) {
    return existing;
  }
  const member = new Member();
  member.user = user;
  member.organization = organization;
  member.role = role;
  await em.persistAndFlush(member);
  return member;
}

export async function seedOrganizations(
  em: EntityManager
): Promise<{ organization: Organization; coachMember: Member }> {
  console.log('Seeding organizations...');

  let organization = await em.findOne(Organization, { slug: ORG_SLUG });
  if (!organization) {
    organization = new Organization();
    organization.name = 'Halterophilie Club';
    organization.slug = ORG_SLUG;
    organization.metadata = JSON.stringify({
      description:
        "Organisation de coaching pour la gestion des athlètes et des programmes d'entraînement",
      type: 'coaching',
      createdAt: new Date().toISOString(),
    });
    await em.persistAndFlush(organization);
    console.log('Created organization:', organization.name);
  } else {
    console.log('Organization already exists:', organization.name);
  }

  const superAdmin = await em.findOne(User, { email: 'super.admin@gmail.com' });
  if (!superAdmin) {
    throw new Error('Super admin user not found. Run seedAthletes first.');
  }
  await ensureMember(em, superAdmin, organization, ORGANIZATION_ROLE.OWNER);

  const coachUser = await em.findOne(User, { email: 'coach@example.com' });
  if (!coachUser) {
    throw new Error('Coach user not found. Run seedAthletes first.');
  }
  const coachMember = await ensureMember(
    em,
    coachUser,
    organization,
    ORGANIZATION_ROLE.ADMIN
  );

  const athleteUsers = await em.find(User, {
    $or: [{ role: { $ne: 'admin' } }, { role: null }],
    email: { $nin: ['coach@example.com'] },
  });
  for (const user of athleteUsers) {
    if (user.email === 'coach@example.com') continue;
    await ensureMember(em, user, organization, ORGANIZATION_ROLE.MEMBER);
  }

  console.log('Organization seeding completed');
  return { organization, coachMember };
}
