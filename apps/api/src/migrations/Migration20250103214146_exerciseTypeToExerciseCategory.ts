import { Migration } from '@mikro-orm/migrations';

export class Migration20250103214146_exerciseTypeToExerciseCategory extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_exercise_type_id_foreign";`);

    this.addSql(`create table "exercise_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "exercise_category_pkey" primary key ("id"));`);

    this.addSql(`drop table if exists "exercise_type" cascade;`);

    this.addSql(`alter table "exercise" rename column "exercise_type_id" to "exercise_category_id";`);
    this.addSql(`alter table "exercise" add constraint "exercise_exercise_category_id_foreign" foreign key ("exercise_category_id") references "exercise_category" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_exercise_category_id_foreign";`);

    this.addSql(`create table "exercise_type" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "exercise_type_pkey" primary key ("id"));`);

    this.addSql(`drop table if exists "exercise_category" cascade;`);

    this.addSql(`alter table "exercise" rename column "exercise_category_id" to "exercise_type_id";`);
    this.addSql(`alter table "exercise" add constraint "exercise_exercise_type_id_foreign" foreign key ("exercise_type_id") references "exercise_type" ("id") on update cascade;`);
  }

}
