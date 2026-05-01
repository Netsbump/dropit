import { Migration } from '@mikro-orm/migrations';

/**
 * Idempotent reference data: exercise, complex, and workout categories.
 * Run after schema exists (db:migration:up for DDL migrations, or schema:sync in dev).
 */
export class Migration20260501093500_ReferenceCategories extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      INSERT INTO "exercise_category" ("id", "name", "created_at", "updated_at", "created_by_id")
      SELECT gen_random_uuid(), v.name, now(), now(), NULL
      FROM (VALUES
        ('Technique'),
        ('Endurance'),
        ('Cardio'),
        ('Renforcement'),
        ('Haltérophilie'),
        ('Musculation')
      ) AS v(name)
      WHERE NOT EXISTS (
        SELECT 1 FROM "exercise_category" ec WHERE ec."name" = v.name
      );
    `);

    this.addSql(`
      INSERT INTO "complex_category" ("id", "name", "created_at", "updated_at", "created_by_id")
      SELECT gen_random_uuid(), v.name, now(), now(), NULL
      FROM (VALUES
        ('Arraché'),
        ('Épaulé-Jeté'),
        ('Renforcement')
      ) AS v(name)
      WHERE NOT EXISTS (
        SELECT 1 FROM "complex_category" cc WHERE cc."name" = v.name
      );
    `);

    this.addSql(`
      INSERT INTO "workout_category" ("id", "name", "created_at", "updated_at", "created_by_id")
      SELECT gen_random_uuid(), v.name, now(), now(), NULL
      FROM (VALUES
        ('Saison'),
        ('Décharge'),
        ('Fond')
      ) AS v(name)
      WHERE NOT EXISTS (
        SELECT 1 FROM "workout_category" wc WHERE wc."name" = v.name
      );
    `);
  }

  override async down(): Promise<void> {
    // No-op: categories may be referenced by user data; removing them risks FK violations.
  }
}
