import { MikroORM } from '@mikro-orm/core';
import { Organization } from '../../modules/identity/domain/organization/organization.entity';
import { User } from '../../modules/identity/domain/auth/user.entity';
import { Member } from '../../modules/identity/domain/organization/member.entity';

export interface TestData {
  organization: Organization;
  adminUser: User;
  memberUser: User;
  adminMember: Member;
  memberMember: Member;
}

/**
 * Nettoie la base de données
 */
export async function cleanDatabase(orm: MikroORM): Promise<void> {
  const generator = orm.getSchemaGenerator();
  await generator.refreshDatabase();
  console.log('🧹 Database cleaned');
}

/**
 * Crée l'organisation et les utilisateurs de test
 */
export async function createTestOrganization(orm: MikroORM): Promise<TestData> {
  // Créer l'organisation
  const organization = new Organization();
  organization.name = 'Test Organization';
  organization.slug = 'test-organization';
  organization.metadata = JSON.stringify({
    description: 'Organisation de test pour les tests d\'intégration',
    type: 'coaching',
    createdAt: new Date().toISOString(),
  });
  await orm.em.persistAndFlush(organization);

  // Créer l'utilisateur admin
  const adminUser = new User();
  adminUser.email = 'admin@test.com';
  adminUser.name = 'Admin User';
  adminUser.isSuperAdmin = false;
  await orm.em.persistAndFlush(adminUser);

  // Créer l'utilisateur member
  const memberUser = new User();
  memberUser.email = 'member@test.com';
  memberUser.name = 'Member User';
  memberUser.isSuperAdmin = false;
  await orm.em.persistAndFlush(memberUser);

  // Créer les relations Member
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