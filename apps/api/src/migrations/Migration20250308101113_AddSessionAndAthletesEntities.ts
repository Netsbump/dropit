import { Migration } from '@mikro-orm/migrations';

export class Migration20250308101113_AddSessionAndAthletesEntities extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "athlete" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "email" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "athlete_pkey" primary key ("id"));`);

    this.addSql(`create table "session" ("id" uuid not null default gen_random_uuid(), "workout_id" uuid not null, "scheduled_date" timestamptz not null, "completed_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "session_pkey" primary key ("id"));`);

    this.addSql(`create table "athlete_session" ("athlete_id" uuid not null, "session_id" uuid not null, "notes_athlete" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "athlete_session_pkey" primary key ("athlete_id", "session_id"));`);

    this.addSql(`alter table "session" add constraint "session_workout_id_foreign" foreign key ("workout_id") references "workout" ("id") on update cascade;`);

    this.addSql(`alter table "athlete_session" add constraint "athlete_session_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`);
    this.addSql(`alter table "athlete_session" add constraint "athlete_session_session_id_foreign" foreign key ("session_id") references "session" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "athlete_session" drop constraint "athlete_session_athlete_id_foreign";`);

    this.addSql(`alter table "athlete_session" drop constraint "athlete_session_session_id_foreign";`);

    this.addSql(`drop table if exists "athlete" cascade;`);

    this.addSql(`drop table if exists "session" cascade;`);

    this.addSql(`drop table if exists "athlete_session" cascade;`);
  }

}
