import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration2 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "nlogger"."requests" add column "timestamp" timestamptz(0) not null, add column "execution_time" int not null;',
    )
    this.addSql('alter table "nlogger"."requests" drop column "raw_body";')
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "nlogger"."requests" add column "raw_body" text not null default null;',
    )
    this.addSql('alter table "nlogger"."requests" drop column "timestamp";')
    this.addSql('alter table "nlogger"."requests" drop column "execution_time";')
  }
}
