import { Migration } from '@mikro-orm/migrations';

export class Migration20250309090627_ChangeMemberToAthlete extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "club_name" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "club_name_pkey" primary key ("id"));`);
    this.addSql(`alter table "club_name" add constraint "club_name_name_unique" unique ("name");`);

    this.addSql(`create table "media" ("id" uuid not null default gen_random_uuid(), "url" varchar(255) not null, "bucket" varchar(255) not null, "file_name" varchar(255) null, "mime_type" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "media_pkey" primary key ("id"));`);

    this.addSql(`create table "club" ("id" uuid not null default gen_random_uuid(), "club_name_id" uuid not null, "logo_id" uuid null, "end_date" timestamptz not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "club_pkey" primary key ("id"));`);
    this.addSql(`alter table "club" add constraint "club_club_name_id_unique" unique ("club_name_id");`);

    this.addSql(`create table "user" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "password" varchar(255) not null, "role" text check ("role" in ('athlete', 'coach', 'admin')) not null, "avatar_id" uuid null, "last_login" timestamptz null, "is_super_admin" boolean not null default false, "is_active" boolean not null default true, "email_verified_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "physical_metric" ("id" uuid not null default gen_random_uuid(), "athlete_id" uuid not null, "weight" int null, "height" real null, "start_date" timestamptz not null, "end_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "physical_metric_pkey" primary key ("id"));`);

    this.addSql(`create table "competitor_status" ("id" uuid not null default gen_random_uuid(), "athlete_id" uuid not null, "level" text check ("level" in ('rookie', 'regional', 'national', 'international', 'elite')) not null, "sex_category" text check ("sex_category" in ('men', 'women')) not null, "weight_category" varchar(255) null, "start_date" timestamptz not null, "end_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "competitor_status_pkey" primary key ("id"));`);

    this.addSql(`create table "coach_athlete" ("coach_id" uuid not null, "athlete_id" uuid not null, "start_date" timestamptz not null, "end_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "coach_athlete_pkey" primary key ("coach_id", "athlete_id"));`);

    this.addSql(`create table "personal_record" ("id" uuid not null default gen_random_uuid(), "exercise_id" uuid not null, "weight" real not null, "athlete_id" uuid not null, "date" timestamptz not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "personal_record_pkey" primary key ("id"));`);

    this.addSql(`alter table "club" add constraint "club_club_name_id_foreign" foreign key ("club_name_id") references "club_name" ("id") on update cascade;`);
    this.addSql(`alter table "club" add constraint "club_logo_id_foreign" foreign key ("logo_id") references "media" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "user" add constraint "user_avatar_id_foreign" foreign key ("avatar_id") references "media" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "physical_metric" add constraint "physical_metric_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`);

    this.addSql(`alter table "competitor_status" add constraint "competitor_status_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`);

    this.addSql(`alter table "coach_athlete" add constraint "coach_athlete_coach_id_foreign" foreign key ("coach_id") references "athlete" ("id") on update cascade;`);
    this.addSql(`alter table "coach_athlete" add constraint "coach_athlete_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`);

    this.addSql(`alter table "personal_record" add constraint "personal_record_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade;`);
    this.addSql(`alter table "personal_record" add constraint "personal_record_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`);

    this.addSql(`alter table "athlete" add column "last_name" varchar(255) not null, add column "birthday" timestamptz not null, add column "user_id" uuid null, add column "club_id" uuid not null;`);
    this.addSql(`alter table "athlete" add constraint "athlete_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "athlete" add constraint "athlete_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade;`);
    this.addSql(`alter table "athlete" rename column "name" to "first_name";`);
    this.addSql(`alter table "athlete" rename column "email" to "country";`);
    this.addSql(`alter table "athlete" add constraint "athlete_user_id_unique" unique ("user_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "club" drop constraint "club_club_name_id_foreign";`);

    this.addSql(`alter table "club" drop constraint "club_logo_id_foreign";`);

    this.addSql(`alter table "user" drop constraint "user_avatar_id_foreign";`);

    this.addSql(`alter table "athlete" drop constraint "athlete_club_id_foreign";`);

    this.addSql(`alter table "athlete" drop constraint "athlete_user_id_foreign";`);

    this.addSql(`drop table if exists "club_name" cascade;`);

    this.addSql(`drop table if exists "media" cascade;`);

    this.addSql(`drop table if exists "club" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "physical_metric" cascade;`);

    this.addSql(`drop table if exists "competitor_status" cascade;`);

    this.addSql(`drop table if exists "coach_athlete" cascade;`);

    this.addSql(`drop table if exists "personal_record" cascade;`);

    this.addSql(`alter table "athlete" drop constraint "athlete_user_id_unique";`);
    this.addSql(`alter table "athlete" drop column "last_name", drop column "birthday", drop column "user_id", drop column "club_id";`);

    this.addSql(`alter table "athlete" rename column "first_name" to "name";`);
    this.addSql(`alter table "athlete" rename column "country" to "email";`);
  }

}
