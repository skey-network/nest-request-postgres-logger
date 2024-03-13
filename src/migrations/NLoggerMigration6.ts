import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration6 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "nlogger"."logs" add column "timestamp" timestamptz(0) not null default now();',
    )
  }

  async down(): Promise<void> {
    this.addSql('alter table "nlogger"."requests" drop column "timestamp";')
  }
}
