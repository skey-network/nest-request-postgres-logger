import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration5 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "nlogger"."logs" drop constraint "logs_request_id_foreign";')

    this.addSql('create index "logs_request_id_index" on "nlogger"."logs" ("request_id");')
  }

  async down(): Promise<void> {
    this.addSql('drop index "nlogger"."logs_request_id_index";')
    this.addSql(
      'alter table "nlogger"."logs" add constraint "logs_request_id_foreign" foreign key ("request_id") references "nlogger"."requests" ("id") on update cascade on delete set null;',
    )
  }
}
