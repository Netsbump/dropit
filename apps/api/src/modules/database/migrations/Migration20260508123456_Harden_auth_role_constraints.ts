import { Migration } from '@mikro-orm/migrations';

export class Migration20260508123456_Harden_auth_role_constaints extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" alter column "role" type varchar(255) using ("role"::varchar(255));`);
    this.addSql(`alter table "user" alter column "role" set default 'user';`);
    this.addSql(`alter table "user" alter column "role" set not null;`);
    this.addSql(`alter table "user" add constraint user_role_check check("role" in ('user', 'admin'));`);

    this.addSql(`alter table "member" add constraint member_role_check check("role" in ('member', 'admin', 'owner'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop constraint user_role_check;`);

    this.addSql(`alter table "user" alter column "role" drop default;`);
    this.addSql(`alter table "user" alter column "role" type varchar(255) using ("role"::varchar(255));`);
    this.addSql(`alter table "user" alter column "role" drop not null;`);

    this.addSql(`alter table "member" drop constraint member_role_check;`);
  }

}
