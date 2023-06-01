import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration3 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "nlogger"."requests" add column "custom_data" jsonb null;')
  }

  async down(): Promise<void> {
    this.addSql('alter table "nlogger"."requests" drop column "custom_data";')
  }
}
