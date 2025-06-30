import { MikroORM } from '@mikro-orm/core';
import { cleanDatabase, createTestOrganization, TestData } from './utils/test-setup';

/**
 * Setup l'organisation et les utilisateurs de test
 */
export async function setupOrganization(orm: MikroORM): Promise<TestData> {
  console.log('📋 Setting up organization...');
  
  // Nettoyer la base de données
  await cleanDatabase(orm);
  
  // Créer l'organisation et les utilisateurs
  const testData = await createTestOrganization(orm);
  
  // Vérifications
  expect(testData.organization).toBeDefined();
  expect(testData.organization.id).toBeDefined();
  expect(testData.organization.name).toBe('Test Organization');
  
  expect(testData.adminUser).toBeDefined();
  expect(testData.adminUser.id).toBeDefined();
  expect(testData.adminUser.email).toBe('admin@test.com');
  
  expect(testData.memberUser).toBeDefined();
  expect(testData.memberUser.id).toBeDefined();
  expect(testData.memberUser.email).toBe('member@test.com');
  
  expect(testData.adminMember).toBeDefined();
  expect(testData.adminMember.role).toBe('admin');
  
  expect(testData.memberMember).toBeDefined();
  expect(testData.memberMember.role).toBe('member');
  
  console.log('✅ Organization setup completed');
  
  return testData;
} 