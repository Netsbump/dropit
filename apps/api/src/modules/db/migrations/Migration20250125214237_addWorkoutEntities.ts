import { Migration } from '@mikro-orm/migrations';

export class Migration20250125214237_addWorkoutEntities extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "training_params" ("id" uuid not null default gen_random_uuid(), "sets" int not null default 1, "reps" int not null default 1, "rest" int null, "duration" int null, "start_weight_percent" int null, "end_weight_percent" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "training_params_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "workout_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_category_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "workout" ("id" uuid not null default gen_random_uuid(), "title" varchar(255) not null, "description" varchar(255) not null, "category_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "workout_element" ("id" uuid not null default gen_random_uuid(), "workout_id" uuid not null, "exercise_id" uuid null, "complex_id" uuid null, "order" int not null, "training_params_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workout_element_pkey" primary key ("id"), constraint check_one_element_type check (`
    );
    this.addSql('    (CASE WHEN exercise_id IS NOT NULL THEN 1 ELSE 0 END +');
    this.addSql('     CASE WHEN complex_id IS NOT NULL THEN 1 ELSE 0 END) = 1');
    this.addSql('  ));');

    this.addSql(
      `alter table "workout" add constraint "workout_category_id_foreign" foreign key ("category_id") references "workout_category" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "workout_element" add constraint "workout_element_workout_id_foreign" foreign key ("workout_id") references "workout" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "workout_element" add constraint "workout_element_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade on delete set null;`
    );
    this.addSql(
      `alter table "workout_element" add constraint "workout_element_complex_id_foreign" foreign key ("complex_id") references "complex" ("id") on update cascade on delete set null;`
    );
    this.addSql(
      `alter table "workout_element" add constraint "workout_element_training_params_id_foreign" foreign key ("training_params_id") references "training_params" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "exercise_complex" add column "training_params_id" uuid not null;`
    );
    this.addSql(
      `alter table "exercise_complex" add constraint "exercise_complex_training_params_id_foreign" foreign key ("training_params_id") references "training_params" ("id") on update cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "exercise_complex" drop constraint "exercise_complex_training_params_id_foreign";`
    );

    this.addSql(
      `alter table "workout_element" drop constraint "workout_element_training_params_id_foreign";`
    );

    this.addSql(
      `alter table "workout" drop constraint "workout_category_id_foreign";`
    );

    this.addSql(
      `alter table "workout_element" drop constraint "workout_element_workout_id_foreign";`
    );

    this.addSql(`drop table if exists "training_params" cascade;`);

    this.addSql(`drop table if exists "workout_category" cascade;`);

    this.addSql(`drop table if exists "workout" cascade;`);

    this.addSql(`drop table if exists "workout_element" cascade;`);

    this.addSql(
      `alter table "exercise_complex" drop column "training_params_id";`
    );
  }
}
