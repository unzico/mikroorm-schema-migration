import { Migration } from "@mikro-orm/migrations";

export class Migration20231113142010 extends Migration {
  async up(): Promise<void> {
    const k = this.getKnex();

    await k.schema
      // comment out the next line to see the migration fail at creating
      // the table in the 'custom' schema by default as it's defined in the config in the `src/index.ts` file
      .withSchema("custom")
      .createTable("test", (t) => {
        t.increments("id").unsigned().primary();
      });
  }

  async down(): Promise<void> {
    const k = this.getKnex();

    await k.schema.dropTableIfExists("test");
  }
}
