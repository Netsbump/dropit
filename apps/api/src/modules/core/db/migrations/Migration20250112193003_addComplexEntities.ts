import { Migration } from '@mikro-orm/migrations';

export class Migration20250112193003_addComplexEntities extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "complex_category" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "complex_category_pkey" primary key ("id"));`);

    this.addSql(`create table "complex" ("id" uuid not null default gen_random_uuid(), "complex_category_id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "complex_pkey" primary key ("id"));`);

    this.addSql(`create table "exercise_complex" ("complex_id" uuid not null, "exercise_id" uuid not null, "order" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "exercise_complex_pkey" primary key ("complex_id", "exercise_id"));`);

    this.addSql(`alter table "complex" add constraint "complex_complex_category_id_foreign" foreign key ("complex_category_id") references "complex_category" ("id") on update cascade;`);

    this.addSql(`alter table "exercise_complex" add constraint "exercise_complex_complex_id_foreign" foreign key ("complex_id") references "complex" ("id") on update cascade;`);
    this.addSql(`alter table "exercise_complex" add constraint "exercise_complex_exercise_id_foreign" foreign key ("exercise_id") references "exercise" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "complex" drop constraint "complex_complex_category_id_foreign";`);

    this.addSql(`alter table "exercise_complex" drop constraint "exercise_complex_complex_id_foreign";`);

    this.addSql(`drop table if exists "complex_category" cascade;`);

    this.addSql(`drop table if exists "complex" cascade;`);

    this.addSql(`drop table if exists "exercise_complex" cascade;`);
  }

}
