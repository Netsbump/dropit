import { Migration } from '@mikro-orm/migrations';

export class Migration20260826181235_DropAthletesUuidDefaults extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "athlete" alter column "id" drop default;`);
    this.addSql(`alter table "athlete" alter column "id" drop default;`);
    this.addSql(
      `alter table "athlete" alter column "id" type uuid using ("id"::text::uuid);`
    );

    this.addSql(
      `alter table "physical_metric" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "physical_metric" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "physical_metric" alter column "id" type uuid using ("id"::text::uuid);`
    );

    this.addSql(
      `alter table "personal_record" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "personal_record" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "personal_record" alter column "id" type uuid using ("id"::text::uuid);`
    );

    this.addSql(
      `alter table "competitor_status" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "competitor_status" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "competitor_status" alter column "id" type uuid using ("id"::text::uuid);`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "athlete" alter column "id" drop default;`);
    this.addSql(
      `alter table "athlete" alter column "id" type uuid using ("id"::text::uuid);`
    );
    this.addSql(
      `alter table "athlete" alter column "id" set default gen_random_uuid();`
    );

    this.addSql(
      `alter table "physical_metric" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "physical_metric" alter column "id" type uuid using ("id"::text::uuid);`
    );
    this.addSql(
      `alter table "physical_metric" alter column "id" set default gen_random_uuid();`
    );

    this.addSql(
      `alter table "personal_record" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "personal_record" alter column "id" type uuid using ("id"::text::uuid);`
    );
    this.addSql(
      `alter table "personal_record" alter column "id" set default gen_random_uuid();`
    );

    this.addSql(
      `alter table "competitor_status" alter column "id" drop default;`
    );
    this.addSql(
      `alter table "competitor_status" alter column "id" type uuid using ("id"::text::uuid);`
    );
    this.addSql(
      `alter table "competitor_status" alter column "id" set default gen_random_uuid();`
    );
  }
}
