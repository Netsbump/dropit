import { MikroORM } from '@mikro-orm/core';
import { Organization } from '../../modules/auth/domain/organization/organization.entity';
import { User } from '../../modules/auth/domain/auth/user.entity';
import { Member } from '../../modules/auth/domain/organization/member.entity';

export interface TestData {
  organization: Organization;
  adminUser: User;
  memberUser: User;
  adminMember: Member;
  memberMember: Member;
}

/**
 * Clean the database
 */
export async function cleanDatabase(orm: MikroORM): Promise<void> {
  const generator = orm.getSchemaGenerator();
  await generator.refreshDatabase();
  console.log('🧹 Database cleaned');
}

/**
 * Create the test organization and users
 */
export async function createTestOrganization(orm: MikroORM): Promise<TestData> {
  // Create the organization
  const organization = new Organization();
  organization.name = 'Test Organization';
  organization.slug = 'test-organization';
  organization.metadata = JSON.stringify({
    description: "Organisation de test pour les tests d'intégration",
    type: 'coaching',
    createdAt: new Date().toISOString(),
  });
  await orm.em.persistAndFlush(organization);

  // Create the admin user (org role = admin; app role = user)
  const adminUser = new User();
  adminUser.email = 'admin@test.com';
  adminUser.name = 'Admin User';
  adminUser.role = 'user';
  await orm.em.persistAndFlush(adminUser);

  // Create the member user
  const memberUser = new User();
  memberUser.email = 'member@test.com';
  memberUser.name = 'Member User';
  memberUser.role = 'user';
  await orm.em.persistAndFlush(memberUser);

  // Create Member relations
  const adminMember = new Member();
  adminMember.user = adminUser;
  adminMember.organization = organization;
  adminMember.role = 'admin';
  await orm.em.persistAndFlush(adminMember);

  const memberMember = new Member();
  memberMember.user = memberUser;
  memberMember.organization = organization;
  memberMember.role = 'member';
  await orm.em.persistAndFlush(memberMember);

  console.log('🏢 Test organization and users created');

  return {
    organization,
    adminUser,
    memberUser,
    adminMember,
    memberMember,
  };
}
