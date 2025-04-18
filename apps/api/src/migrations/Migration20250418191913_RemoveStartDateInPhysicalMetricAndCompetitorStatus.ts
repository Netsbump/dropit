import { Migration } from '@mikro-orm/migrations';

export class Migration20250418191913_RemoveStartDateInPhysicalMetricAndCompetitorStatus extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "physical_metric" drop column "start_date";`);

    this.addSql(`alter table "competitor_status" drop column "start_date";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "physical_metric" add column "start_date" timestamptz not null;`);

    this.addSql(`alter table "competitor_status" add column "start_date" timestamptz not null;`);
  }

}
