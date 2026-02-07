import { EntityManager } from '@mikro-orm/core';
import { Athlete } from  '../modules/athletes/domain/athlete.entity';
import { faker } from '@faker-js/faker';
import { User } from '../modules/auth/domain/auth/user.entity';
import { hashPassword } from 'better-auth/crypto';
import { Account } from '../modules/auth/domain/auth/account.entity';

export async function seedAthletes(
  em: EntityManager
): Promise<{ athletes: Athlete[]; coach: Athlete }> {
  console.log('Seeding one super admin...');
  
  // Create a super admin
  const superAdmin = new User();
  superAdmin.name = 'Super Admin';
  superAdmin.email = 'super.admin@gmail.com';
  superAdmin.emailVerified = true;
  // The isSuperAdmin field is created automatically by better-auth config
  await em.persistAndFlush(superAdmin);

  // Update the isSuperAdmin field manually via SQL
  await em.getConnection().execute(
    'UPDATE "user" SET is_super_admin = true WHERE id = ?',
    [superAdmin.id]
  );

  const superAdminAccount = new Account();
  superAdminAccount.user = superAdmin;
  superAdminAccount.providerId = 'credential';
  superAdminAccount.accountId = superAdmin.email;
  superAdminAccount.password = await hashPassword('Password123!');
  await em.persistAndFlush(superAdminAccount);

  console.log('Super admin created');

  console.log('Seeding athletes and coach...');

  const athletes: Athlete[] = [];
  let coach: Athlete | null = null;

  // Create a coach
  const coachUser = new User();
  coachUser.name = 'Jean Dupont';
  coachUser.email = 'coach@example.com';
  coachUser.emailVerified = true;
  await em.persistAndFlush(coachUser);

  const coachAccount = new Account();
  coachAccount.user = coachUser;
  coachAccount.providerId = 'credential';
  coachAccount.accountId = coachUser.email;
  coachAccount.password = await hashPassword('Password123!');
  await em.persistAndFlush(coachAccount);

  coach = new Athlete();
  coach.firstName = 'Jean';
  coach.lastName = 'Dupont';
  coach.birthday = new Date('1985-05-15');
  coach.country = 'France';
  coach.user = coachUser;

  await em.persistAndFlush(coach);
  athletes.push(coach);

  // Create athletes with faker
  const numberOfAthletes = faker.number.int({ min: 15, max: 25 });
  
  for (let i = 0; i < numberOfAthletes; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    const user = new User();
    user.email = email.toLowerCase();
    user.name = `${firstName} ${lastName}`;
    user.emailVerified = true;
    await em.persistAndFlush(user);

    // Create an account with password for each athlete
    const account = new Account();
    account.user = user;
    account.providerId = 'credential';
    account.accountId = user.email;
    account.password = await hashPassword('Password123!');
    await em.persistAndFlush(account);

    const athlete = new Athlete();
    athlete.firstName = firstName;
    athlete.lastName = lastName;
    athlete.birthday = faker.date.birthdate({ min: 16, max: 35, mode: 'age' });
    athlete.country = 'France';
    athlete.user = user;

    await em.persistAndFlush(athlete);
    athletes.push(athlete);
  }

  console.log(`1 coach and ${athletes.length - 1} athletes seeded`);
  return { athletes, coach };
}
