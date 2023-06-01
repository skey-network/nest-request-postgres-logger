import { Constructor } from '@mikro-orm/core'
import { Migration } from '@mikro-orm/migrations'
import { NLoggerMigration1 } from './NLoggerMigration1'
import { NLoggerMigration2 } from './NLoggerMigration2'
import { NLoggerMigration3 } from './NLoggerMigration3'
import { NLoggerMigration4 } from './NLoggerMigration4'
import { NLoggerMigration5 } from './NLoggerMigration5'

export const migrations: Constructor<Migration>[] = [
  NLoggerMigration1,
  NLoggerMigration2,
  NLoggerMigration3,
  NLoggerMigration4,
  NLoggerMigration5,
]
