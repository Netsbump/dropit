import { Migration } from '@mikro-orm/migrations';

export class Migration20250202140401_DeleteTrainingParamsEntityAndRelations extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exercise_complex" drop constraint "exercise_complex_training_params_id_foreign";`);

    this.addSql(`alter table "workout_element" drop constraint "workout_element_training_params_id_foreign";`);

    this.addSql(`drop table if exists "training_params" cascade;`);

    this.addSql(`alter table "exercise_complex" drop column "training_params_id";`);

    this.addSql(`alter table "exercise_complex" add column "reps" int not null default 1;`);

    this.addSql(`alter table "workout_element" drop column "training_params_id";`);

    this.addSql(`alter table "workout_element" add column "sets" int not null default 1, add column "reps" int not null default 1, add column "rest" int null, add column "duration" int null, add column "start_weight_percent" int null, add column "end_weight_percent" int null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "training_params" ("id" uuid not null default gen_random_uuid(), "sets" int not null default 1, "reps" int not null default 1, "rest" int null, "duration" int null, "start_weight_percent" int null, "end_weight_percent" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "training_params_pkey" primary key ("id"));`);

    this.addSql(`alter table "exercise_complex" drop column "reps";`);

    this.addSql(`alter table "exercise_complex" add column "training_params_id" uuid not null;`);
    this.addSql(`alter table "exercise_complex" add constraint "exercise_complex_training_params_id_foreign" foreign key ("training_params_id") references "training_params" ("id") on update cascade;`);

    this.addSql(`alter table "workout_element" drop column "sets", drop column "reps", drop column "rest", drop column "duration", drop column "start_weight_percent", drop column "end_weight_percent";`);

    this.addSql(`alter table "workout_element" add column "training_params_id" uuid not null;`);
    this.addSql(`alter table "workout_element" add constraint "workout_element_training_params_id_foreign" foreign key ("training_params_id") references "training_params" ("id") on update cascade;`);
  }

}
