import { Migration } from '@mikro-orm/migrations';

export class Migration20250330075158_AddRelationsToAthlete extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "club" drop column "end_date";`);

    this.addSql(`alter table "competitor_status" alter column "weight_category" type int using ("weight_category"::int);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "club" add column "end_date" timestamptz not null;`);

    this.addSql(`alter table "competitor_status" alter column "weight_category" type varchar(255) using ("weight_category"::varchar(255));`);
  }

}
