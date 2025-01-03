import { Migration } from '@mikro-orm/migrations';

export class Migration20250103192244_idNumberToUuid extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exercise" drop constraint "exercise_exercise_type_id_foreign";`);
    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise_type" alter column "id" drop default;`);
    this.addSql(`alter table "exercise_type" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "exercise_type" alter column "id" set default gen_random_uuid();`);

    this.addSql(`alter table "test" alter column "id" drop default;`);
    this.addSql(`alter table "test" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "test" alter column "id" set default gen_random_uuid();`);

    this.addSql(`alter table "video" alter column "id" drop default;`);
    this.addSql(`alter table "video" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "video" alter column "id" set default gen_random_uuid();`);

    this.addSql(`alter table "exercise" alter column "id" drop default;`);
    this.addSql(`alter table "exercise" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "exercise" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "exercise" alter column "exercise_type_id" drop default;`);
    this.addSql(`alter table "exercise" alter column "exercise_type_id" type uuid using ("exercise_type_id"::text::uuid);`);
    this.addSql(`alter table "exercise" alter column "video_id" drop default;`);
    this.addSql(`alter table "exercise" alter column "video_id" type uuid using ("video_id"::text::uuid);`);
    this.addSql(`alter table "exercise" add constraint "exercise_exercise_type_id_foreign" foreign key ("exercise_type_id") references "exercise_type" ("id") on update cascade;`);
    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "exercise_type" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "test" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "video" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "exercise" alter column "id" type text using ("id"::text);`);
    this.addSql(`alter table "exercise" alter column "exercise_type_id" type text using ("exercise_type_id"::text);`);
    this.addSql(`alter table "exercise" alter column "video_id" type text using ("video_id"::text);`);

    this.addSql(`alter table "exercise" drop constraint "exercise_exercise_type_id_foreign";`);
    this.addSql(`alter table "exercise" drop constraint "exercise_video_id_foreign";`);

    this.addSql(`alter table "exercise_type" alter column "id" drop default;`);
    this.addSql(`alter table "exercise_type" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "exercise_type_id_seq";`);
    this.addSql(`select setval('exercise_type_id_seq', (select max("id") from "exercise_type"));`);
    this.addSql(`alter table "exercise_type" alter column "id" set default nextval('exercise_type_id_seq');`);

    this.addSql(`alter table "test" alter column "id" drop default;`);
    this.addSql(`alter table "test" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "test_id_seq";`);
    this.addSql(`select setval('test_id_seq', (select max("id") from "test"));`);
    this.addSql(`alter table "test" alter column "id" set default nextval('test_id_seq');`);

    this.addSql(`alter table "video" alter column "id" drop default;`);
    this.addSql(`alter table "video" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "video_id_seq";`);
    this.addSql(`select setval('video_id_seq', (select max("id") from "video"));`);
    this.addSql(`alter table "video" alter column "id" set default nextval('video_id_seq');`);

    this.addSql(`alter table "exercise" alter column "id" drop default;`);
    this.addSql(`alter table "exercise" alter column "id" type int using ("id"::int);`);
    this.addSql(`alter table "exercise" alter column "exercise_type_id" type int using ("exercise_type_id"::int);`);
    this.addSql(`alter table "exercise" alter column "video_id" type int using ("video_id"::int);`);
    this.addSql(`create sequence if not exists "exercise_id_seq";`);
    this.addSql(`select setval('exercise_id_seq', (select max("id") from "exercise"));`);
    this.addSql(`alter table "exercise" alter column "id" set default nextval('exercise_id_seq');`);
    this.addSql(`alter table "exercise" add constraint "exercise_exercise_type_id_foreign" foreign key ("exercise_type_id") references "exercise_type" ("id") on update cascade;`);
    this.addSql(`alter table "exercise" add constraint "exercise_video_id_foreign" foreign key ("video_id") references "video" ("id") on update cascade on delete set null;`);
  }

}
