import { Migration } from '@mikro-orm/migrations';

export class Migration20260501093450_Init_schema extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "media" ("id" uuid not null default gen_random_uuid(), "url" varchar(255) not null, "bucket" varchar(255) not null, "file_name" varchar(255) null, "mime_type" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "media_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "organization" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "slug" varchar(255) null, "logo" varchar(255) null, "metadata" varchar(255) null, "createdAt" timestamptz not null, constraint "organization_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "user" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "email" varchar(255) not null, "emailVerified" boolean not null default false, "image" varchar(255) null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "role" varchar(255) null, "banned" boolean null, "banReason" varchar(255) null, "banExpires" timestamptz null, constraint "user_pkey" primary key ("id"));`
    );
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`
    );

    this.addSql(
      `create table "session" ("id" uuid not null default gen_random_uuid(), "expiresAt" timestamptz not null, "token" varchar(255) not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "ipAddress" varchar(255) null, "userAgent" varchar(255) null, "activeOrganizationId" varchar(255) null, "impersonatedBy" varchar(255) null, "userId" uuid not null, constraint "session_pkey" primary key ("id"));`
    );
    this.addSql(
      `alter table "session" add constraint "session_token_unique" unique ("token");`
    );

    this.addSql(
      `create table "member" ("id" uuid not null default gen_random_uuid(), "userId" uuid not null, "organizationId" uuid not null, "role" varchar(255) not null default 'member', "createdAt" timestamptz not null, constraint "member_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "invitation" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "inviterId" uuid not null, "organizationId" uuid not null, "role" varchar(255) not null, "status" varchar(255) not null, "createdAt" timestamptz not null, "expiresAt" timestamptz not null, constraint "invitation_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "exercise_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_by_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "exercise_category_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "exercise" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "english_name" varchar(255) null, "short_name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" uuid null, "exercise_category_id" uuid not null, "video_id" uuid null, constraint "exercise_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "complex_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_by_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "complex_category_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "complex" ("id" uuid not null default gen_random_uuid(), "complex_category_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" uuid null, constraint "complex_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "exercise_complex" ("complex_id" uuid not null, "exercise_id" uuid not null, "order" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "exercise_complex_pkey" primary key ("complex_id", "exercise_id"));`
    );

    this.addSql(
      `create table "athlete" ("id" uuid not null default gen_random_uuid(), "first_name" varchar(255) not null, "last_name" varchar(255) not null, "birthday" timestamptz null, "country" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, constraint "athlete_pkey" primary key ("id"));`
    );
    this.addSql(
      `alter table "athlete" add constraint "athlete_user_id_unique" unique ("user_id");`
    );

    this.addSql(
      `create table "physical_metric" ("id" uuid not null default gen_random_uuid(), "weight" int null, "height" real null, "date" timestamptz not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "athlete_id" uuid not null, constraint "physical_metric_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "personal_record" ("id" uuid not null default gen_random_uuid(), "weight" real not null, "date" timestamptz not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "athlete_id" uuid not null, "exercise_id" uuid not null, constraint "personal_record_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "competitor_status" ("id" uuid not null default gen_random_uuid(), "level" text check ("level" in ('rookie', 'regional', 'national', 'international', 'elite')) not null, "sex_category" text check ("sex_category" in ('men', 'women')) not null, "weight_category" int null, "end_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "athlete_id" uuid not null, constraint "competitor_status_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "account" ("id" uuid not null default gen_random_uuid(), "accountId" varchar(255) not null, "providerId" varchar(255) not null, "userId" uuid not null, "accessToken" varchar(255) null, "refreshToken" varchar(255) null, "idToken" varchar(255) null, "accessTokenExpiresAt" timestamptz null, "refreshTokenExpiresAt" timestamptz null, "scope" varchar(255) null, "password" varchar(255) null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, constraint "account_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "verification" ("id" uuid not null default gen_random_uuid(), "identifier" varchar(255) not null, "value" varchar(255) not null, "expiresAt" timestamptz not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, constraint "verification_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "workout_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_by_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_category_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "workout" ("id" uuid not null default gen_random_uuid(), "description" varchar(255) not null, "category_id" uuid not null, "created_by_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "training_session" ("id" uuid not null default gen_random_uuid(), "workout_id" uuid not null, "organization_id" uuid not null, "scheduled_date" timestamptz not null, "completed_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "training_session_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "athlete_training_session" ("athlete_id" uuid not null, "training_session_id" uuid not null, "notes_athlete" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "athlete_training_session_pkey" primary key ("athlete_id", "training_session_id"));`
    );

    this.addSql(
      `create table "workout_element" ("id" uuid not null default gen_random_uuid(), "type" text check ("type" in ('exercise', 'complex')) not null, "workout_id" uuid not null, "exercise_id" uuid null, "complex_id" uuid null, "blocks" jsonb not null, "order" int not null, "tempo" varchar(255) null, "commentary" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_element_pkey" primary key ("id"));`
    );
    this.addSql(
      `alter table "workout_element" add constraint check_one_element_type check((type = 'exercise' AND exercise_id IS NOT NULL AND complex_id IS NULL) OR (type = 'complex' AND complex_id IS NOT NULL AND exercise_id IS NULL));`
    );

    this.addSql(
      `alter table "session" add constraint "session_userId_foreign" foreign key ("userId") references "user" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "member" add constraint "member_userId_foreign" foreign key ("userId") references "user" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "member" add constraint "member_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "invitation" add constraint "invitation_inviterId_foreign" foreign key ("inviterId") references "user" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "invitation" add constraint "invitation_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "exercise_category" add constraint "exercise_category_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete set null;`
    );

    this.addSql(
      `alter table "exercise" add constraint "exercise_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "exercise" add constraint "exercise_exercise_category_id_foreign" foreign key ("exercise_category_id") references "exercise_category" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "media" ("id") on update cascade on delete set null;`
    );

    this.addSql(
      `alter table "complex_category" add constraint "complex_category_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete set null;`
    );

    this.addSql(
      `alter table "complex" add constraint "complex_complex_category_id_foreign" foreign key ("complex_category_id") references "complex_category" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "complex" add constraint "complex_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "exercise_complex" add constraint "exercise_complex_complex_id_foreign" foreign key ("complex_id") references "complex" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "exercise_complex" add constraint "exercise_complex_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "athlete" add constraint "athlete_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "physical_metric" add constraint "physical_metric_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "personal_record" add constraint "personal_record_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "personal_record" add constraint "personal_record_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "competitor_status" add constraint "competitor_status_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "account" add constraint "account_userId_foreign" foreign key ("userId") references "user" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "workout_category" add constraint "workout_category_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete set null;`
    );

    this.addSql(
      `alter table "workout" add constraint "workout_category_id_foreign" foreign key ("category_id") references "workout_category" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "workout" add constraint "workout_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade on delete cascade;`
    );

    this.addSql(
      `alter table "training_session" add constraint "training_session_workout_id_foreign" foreign key ("workout_id") references "workout" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "training_session" add constraint "training_session_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "athlete_training_session" add constraint "athlete_training_session_athlete_id_foreign" foreign key ("athlete_id") references "athlete" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "athlete_training_session" add constraint "athlete_training_session_training_session_id_foreign" foreign key ("training_session_id") references "training_session" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "workout_element" add constraint "workout_element_workout_id_foreign" foreign key ("workout_id") references "workout" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "workout_element" add constraint "workout_element_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "workout_element" add constraint "workout_element_complex_id_foreign" foreign key ("complex_id") references "complex" ("id") on update cascade on delete cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "exercise" drop constraint "exercise_video_id_foreign";`
    );

    this.addSql(
      `alter table "member" drop constraint "member_organizationId_foreign";`
    );

    this.addSql(
      `alter table "invitation" drop constraint "invitation_organizationId_foreign";`
    );

    this.addSql(
      `alter table "training_session" drop constraint "training_session_organization_id_foreign";`
    );

    this.addSql(
      `alter table "session" drop constraint "session_userId_foreign";`
    );

    this.addSql(
      `alter table "member" drop constraint "member_userId_foreign";`
    );

    this.addSql(
      `alter table "invitation" drop constraint "invitation_inviterId_foreign";`
    );

    this.addSql(
      `alter table "exercise_category" drop constraint "exercise_category_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "exercise" drop constraint "exercise_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "complex_category" drop constraint "complex_category_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "complex" drop constraint "complex_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "athlete" drop constraint "athlete_user_id_foreign";`
    );

    this.addSql(
      `alter table "account" drop constraint "account_userId_foreign";`
    );

    this.addSql(
      `alter table "workout_category" drop constraint "workout_category_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "workout" drop constraint "workout_created_by_id_foreign";`
    );

    this.addSql(
      `alter table "exercise" drop constraint "exercise_exercise_category_id_foreign";`
    );

    this.addSql(
      `alter table "exercise_complex" drop constraint "exercise_complex_exercise_id_foreign";`
    );

    this.addSql(
      `alter table "personal_record" drop constraint "personal_record_exercise_id_foreign";`
    );

    this.addSql(
      `alter table "workout_element" drop constraint "workout_element_exercise_id_foreign";`
    );

    this.addSql(
      `alter table "complex" drop constraint "complex_complex_category_id_foreign";`
    );

    this.addSql(
      `alter table "exercise_complex" drop constraint "exercise_complex_complex_id_foreign";`
    );

    this.addSql(
      `alter table "workout_element" drop constraint "workout_element_complex_id_foreign";`
    );

    this.addSql(
      `alter table "physical_metric" drop constraint "physical_metric_athlete_id_foreign";`
    );

    this.addSql(
      `alter table "personal_record" drop constraint "personal_record_athlete_id_foreign";`
    );

    this.addSql(
      `alter table "competitor_status" drop constraint "competitor_status_athlete_id_foreign";`
    );

    this.addSql(
      `alter table "athlete_training_session" drop constraint "athlete_training_session_athlete_id_foreign";`
    );

    this.addSql(
      `alter table "workout" drop constraint "workout_category_id_foreign";`
    );

    this.addSql(
      `alter table "training_session" drop constraint "training_session_workout_id_foreign";`
    );

    this.addSql(
      `alter table "workout_element" drop constraint "workout_element_workout_id_foreign";`
    );

    this.addSql(
      `alter table "athlete_training_session" drop constraint "athlete_training_session_training_session_id_foreign";`
    );

    this.addSql(`drop table if exists "media" cascade;`);

    this.addSql(`drop table if exists "organization" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "session" cascade;`);

    this.addSql(`drop table if exists "member" cascade;`);

    this.addSql(`drop table if exists "invitation" cascade;`);

    this.addSql(`drop table if exists "exercise_category" cascade;`);

    this.addSql(`drop table if exists "exercise" cascade;`);

    this.addSql(`drop table if exists "complex_category" cascade;`);

    this.addSql(`drop table if exists "complex" cascade;`);

    this.addSql(`drop table if exists "exercise_complex" cascade;`);

    this.addSql(`drop table if exists "athlete" cascade;`);

    this.addSql(`drop table if exists "physical_metric" cascade;`);

    this.addSql(`drop table if exists "personal_record" cascade;`);

    this.addSql(`drop table if exists "competitor_status" cascade;`);

    this.addSql(`drop table if exists "account" cascade;`);

    this.addSql(`drop table if exists "verification" cascade;`);

    this.addSql(`drop table if exists "workout_category" cascade;`);

    this.addSql(`drop table if exists "workout" cascade;`);

    this.addSql(`drop table if exists "training_session" cascade;`);

    this.addSql(`drop table if exists "athlete_training_session" cascade;`);

    this.addSql(`drop table if exists "workout_element" cascade;`);
  }
}
