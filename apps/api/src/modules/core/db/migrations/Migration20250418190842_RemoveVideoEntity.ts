import { Migration } from '@mikro-orm/migrations';

export class Migration20250418190842_RemoveVideoEntity extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`drop table if exists "video" cascade;`);

    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "media" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "video" ("id" uuid not null default gen_random_uuid(), "src" varchar(255) not null, "metadata" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "video_pkey" primary key ("id"));`);

    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade on delete set null;`);
  }

}
