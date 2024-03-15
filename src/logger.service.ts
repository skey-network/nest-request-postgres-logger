import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver, defineConfig } from '@mikro-orm/postgresql'
import {
  Inject,
  Injectable,
  LoggerService,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { ClsService } from 'nestjs-cls'
import { hostname } from 'os'
import * as winston from 'winston'
import { PapertrailTransport } from 'winston-papertrail-transport'
import { LogEntity } from './entities/log.entity'
import { RequestEntity } from './entities/request.entity'
import { REQUEST_ID_KEY } from './logger.constants'
import { MODULE_OPTIONS_TOKEN } from './logger.definition'
import { DatabaseItem, NLoggerOptions } from './logger.interfaces'
import { migrations } from './migrations'

@Injectable()
export class NLoggerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private orm: MikroORM<PostgreSqlDriver>
  private queue: DatabaseItem[] = []
  private interval: NodeJS.Timeout

  winston: LoggerService | null

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: NLoggerOptions,
    private readonly clsService: ClsService,
  ) {
    this.winston = this.createWinstonInstance()
  }

  async onApplicationBootstrap() {
    try {
      this.orm = await MikroORM.init(this.getConnectionConfig(), true)

      const migrator = this.orm.getMigrator()

      await migrator.getStorage().ensureTable()
      await migrator.up()
    } catch (e) {
      console.error('Failed to connect to db:', e)
    }

    this.interval = setInterval(() => {
      this.insertDatabaseItems()
    }, this.options.dbConfig.updateInternvalMs ?? 1500)
  }

  async onApplicationShutdown() {
    clearInterval(this.interval)

    await this.orm.close(true)
  }

  pushDatabaseItem(item: DatabaseItem) {
    if (item.type === 'log' && this.clsService.isActive()) {
      item.data.requestId = this.clsService.get(REQUEST_ID_KEY) ?? null
    }

    this.queue.push(item)
  }

  private async insertDatabaseItems() {
    if (!this.queue.length) return

    const batch = this.queue
    this.queue = []

    try {
      await this.insertFilteredItems(batch, [RequestEntity, 'request'])
      await this.insertFilteredItems(batch, [LogEntity, 'log'])
    } catch (e) {
      console.error('Failed to insert request logs to db:', e)
    }
  }

  private async insertFilteredItems(
    batch: DatabaseItem[],
    [Entity, type]: [typeof RequestEntity, 'request'] | [typeof LogEntity, 'log'],
  ) {
    const filtered = batch.filter((el) => el.type === type).map((el) => el.data)
    if (!filtered.length) return

    await this.orm.em.insertMany(Entity, filtered)
  }

  private getConnectionConfig() {
    return defineConfig({
      ...this.options.dbConfig,
      schema: 'nlogger',
      entities: [RequestEntity, LogEntity],
      migrations: {
        tableName: 'migrations',
        migrationsList: migrations.map((migration) => ({ class: migration, name: migration.name })),
        disableForeignKeys: false,
      },
    })
  }

  private createWinstonInstance() {
    const cfg = this.options.papertrailConfig
    if (!cfg) return null

    return WinstonModule.createLogger({
      level: cfg.logLevel,
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      transports: [
        new PapertrailTransport({
          host: cfg.host,
          port: cfg.port,
          hostname: hostname(),
          program: cfg.systemName,
        }) as any,
      ],
    })
  }
}
