import { Migration } from '@mikro-orm/migrations';

export class Migration20241227130640_featureExercises extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "exercise_type" ("id" serial primary key, "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "video" ("id" serial primary key, "src" varchar(255) not null, "metadata" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "exercise" ("id" serial primary key, "exercise_type_id" int not null, "video_id" int not null, "name" varchar(255) not null, "description" varchar(255) null, "english_name" varchar(255) null, "short_name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "exercise" add constraint "exercise_exercise_type_id_foreign" foreign key ("exercise_type_id") references "exercise_type" ("id") on update cascade;`);
    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_exercise_type_id_foreign";`);

    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`drop table if exists "exercise_type" cascade;`);

    this.addSql(`drop table if exists "video" cascade;`);

    this.addSql(`drop table if exists "exercise" cascade;`);
  }

}
