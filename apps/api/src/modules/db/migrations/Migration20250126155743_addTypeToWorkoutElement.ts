import { Migration } from '@mikro-orm/migrations';

export class Migration20250126155743_addTypeToWorkoutElement extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "workout_element" add column "type" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "workout_element" drop column "type";`);
  }

}
