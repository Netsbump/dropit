import { Migration } from '@mikro-orm/migrations';

export class Migration20241229101702_makeVideoIdNullable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise" alter column "video_id" type int using ("video_id"::int);`);
    this.addSql(`alter table "exercise" alter column "video_id" drop not null;`);
    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise" alter column "video_id" type int using ("video_id"::int);`);
    this.addSql(`alter table "exercise" alter column "video_id" set not null;`);
    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade;`);
  }

}
