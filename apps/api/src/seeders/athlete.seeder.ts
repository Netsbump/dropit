import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { hashPassword } from 'better-auth/crypto';
import { generateAthleteId } from '../modules/athletes/domain/athlete-id';
import { Account } from '../modules/auth/domain/auth/account.entity';
import { User } from '../modules/auth/domain/auth/user.entity';
import { AthleteEntity as Athlete } from '../modules/database/entities/athlete.entity';

/** Coach + 18 generated athletes (same order of magnitude as the old 15–25 range). */
const TARGET_ATHLETE_COUNT = 19;

export async function seedAthletes(
  em: EntityManager
): Promise<{ athletes: Athlete[]; coach: Athlete }> {
  console.log('Ensuring super admin...');

  let superAdmin = await em.findOne(User, { email: 'super.admin@gmail.com' });
  if (!superAdmin) {
    superAdmin = new User();
    superAdmin.name = 'Super Admin';
    superAdmin.email = 'super.admin@gmail.com';
    superAdmin.emailVerified = true;
    superAdmin.role = 'admin';
    await em.persistAndFlush(superAdmin);
  }

  let superAdminAccount = await em.findOne(Account, {
    user: superAdmin,
    providerId: 'credential',
  });
  if (!superAdminAccount) {
    superAdminAccount = new Account();
    superAdminAccount.user = superAdmin;
    superAdminAccount.providerId = 'credential';
    superAdminAccount.accountId = superAdmin.email;
    superAdminAccount.password = await hashPassword('Password123!');
    await em.persistAndFlush(superAdminAccount);
  }

  console.log('Ensuring coach and athletes...');

  let coachUser = await em.findOne(User, { email: 'coach@example.com' });
  if (!coachUser) {
    coachUser = new User();
    coachUser.name = 'Jean Dupont';
    coachUser.email = 'coach@example.com';
    coachUser.emailVerified = true;
    coachUser.role = 'user';
    await em.persistAndFlush(coachUser);
  }

  let coach = await em.findOne(Athlete, { user: coachUser });
  if (!coach) {
    coach = new Athlete();
    coach.id = generateAthleteId();
    coach.firstName = 'Jean';
    coach.lastName = 'Dupont';
    coach.birthday = new Date('1985-05-15');
    coach.country = 'France';
    coach.user = coachUser;
    await em.persistAndFlush(coach);
  }

  const currentTotal = await em.count(Athlete);
  const toCreate = Math.max(0, TARGET_ATHLETE_COUNT - currentTotal);
  for (let i = 0; i < toCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const user = new User();
    user.email = email;
    user.name = `${firstName} ${lastName}`;
    user.emailVerified = true;
    user.role = 'user';
    await em.persistAndFlush(user);

    const account = new Account();
    account.user = user;
    account.providerId = 'credential';
    account.accountId = user.email;
    account.password = await hashPassword('Password123!');
    await em.persistAndFlush(account);

    const athlete = new Athlete();
    athlete.id = generateAthleteId();
    athlete.firstName = firstName;
    athlete.lastName = lastName;
    athlete.birthday = faker.date.birthdate({ min: 16, max: 35, mode: 'age' });
    athlete.country = 'France';
    athlete.user = user;
    await em.persistAndFlush(athlete);
  }

  const athletes = await em.find(Athlete, {});
  console.log(`Athletes ready: ${athletes.length} total`);
  return { athletes, coach };
}
