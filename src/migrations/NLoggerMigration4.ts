import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration4 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "nlogger"."logs" ("id" uuid not null default uuid_generate_v4(), "type" text not null, "context" text null, "data" text null, "request_id" uuid null, constraint "logs_pkey" primary key ("id"));',
    )

    this.addSql(
      'alter table "nlogger"."logs" add constraint "logs_request_id_foreign" foreign key ("request_id") references "nlogger"."requests" ("id") on update cascade on delete set null;',
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "nlogger"."logs" cascade;')
  }
}
