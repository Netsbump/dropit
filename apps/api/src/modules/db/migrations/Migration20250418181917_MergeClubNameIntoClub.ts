import { Migration } from '@mikro-orm/migrations';

export class Migration20250418181917_MergeClubNameIntoClub extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "club" drop constraint "club_club_name_id_foreign";`);

    this.addSql(`drop table if exists "club_name" cascade;`);

    this.addSql(`alter table "club" drop constraint "club_club_name_id_unique";`);
    this.addSql(`alter table "club" drop column "club_name_id";`);

    this.addSql(`alter table "club" add column "name" varchar(255) not null;`);
    this.addSql(`alter table "club" add constraint "club_name_unique" unique ("name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "club_name" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "club_name_pkey" primary key ("id"));`);
    this.addSql(`alter table "club_name" add constraint "club_name_name_unique" unique ("name");`);

    this.addSql(`alter table "club" drop constraint "club_name_unique";`);
    this.addSql(`alter table "club" drop column "name";`);

    this.addSql(`alter table "club" add column "club_name_id" uuid not null;`);
    this.addSql(`alter table "club" add constraint "club_club_name_id_foreign" foreign key ("club_name_id") references "club_name" ("id") on update cascade;`);
    this.addSql(`alter table "club" add constraint "club_club_name_id_unique" unique ("club_name_id");`);
  }

}
