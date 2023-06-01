import { Migration } from '@mikro-orm/migrations'

export class NLoggerMigration1 extends Migration {
  async up(): Promise<void> {
    this.addSql('create extension if not exists "uuid-ossp"')

    this.addSql('create schema if not exists "nlogger";')

    this.addSql(
      'create table "nlogger"."requests" ("id" uuid not null default uuid_generate_v4(), "method" text not null, "path" text not null, "params" jsonb not null, "query" jsonb not null, "body" jsonb not null, "headers" jsonb not null, "raw_body" text not null, "status" int not null, "error" boolean not null, "ip" text null, "response_body" jsonb null, "user_id" uuid null, constraint "requests_pkey" primary key ("id"));',
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "nlogger"."requests" cascade;')

    this.addSql('drop schema if exists "nlogger";')
  }
}
