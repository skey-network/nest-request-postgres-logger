import { RequiredEntityData } from '@mikro-orm/core'
import { PostgreSqlOptions } from '@mikro-orm/postgresql/PostgreSqlMikroORM'
import { Request } from 'express'
import { ClsService } from 'nestjs-cls'
import { LogEntity } from './entities/log.entity'
import { RequestEntity } from './entities/request.entity'

export type DbConfig = Omit<
  PostgreSqlOptions,
  'schema' | 'entities' | 'entitiesTs' | 'migrations'
> & {
  updateInternvalMs?: number // How often batch of logs is saved to db
}

export type PapertrailLogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

export type PapertrailConfig = {
  host: string
  port: number
  systemName: string
  logLevel?: PapertrailLogLevel
}

export interface NLoggerOptions {
  /**
   * Mikro orm connection config
   * https://mikro-orm.io/api/5.6/core/interface/MikroORMOptions
   *
   * Some properties are overridden by logger
   */
  dbConfig?: DbConfig

  /**
   * Config to syslog transport to papertrail
   */
  papertrailConfig?: PapertrailConfig

  /**
   * Whether to mount middleware automatically
   *
   * Defaults to true
   */
  mountMiddleware?: boolean

  /**
   * List of request headers to log and save
   *
   * Defaults to ['user-agent', 'content-type']
   */
  headers?: string[]

  /**
   * List of property keys to hide from request body and query
   *
   * Defaults to []
   */
  hiddenProperties?: string[]

  /**
   * Result of this function will be saved with request as userId
   */
  userIdExtractor?: (req: Request, cls: ClsService) => string | null

  /**
   * Result of this function will be saved with request customData
   */
  customDataExtractor?: (req: Request, cls: ClsService) => Record<string, any> | null

  /**
   * Skip logging messages from these contexts
   *
   * Defaults to [
   *   'RouterExplorer',
   *   'InstanceLoader',
   *   'NestFactory',
   *   'NestApplication',
   *   'ClsModule',
   *   'RoutesResolver'
   * ]
   */
  skipContexts?: string[]

  /**
   * Optionally substitute 'Nest' and pid prefix with custom string
   */
  logPrefix?: string
}

export interface RequestDatabaseItem {
  type: 'request'
  data: RequiredEntityData<RequestEntity>
}

export interface LogDatabaseItem {
  type: 'log'
  data: RequiredEntityData<LogEntity>
}

export type DatabaseItem = RequestDatabaseItem | LogDatabaseItem

export type LogType = 'log' | 'warn' | 'error' | 'debug' | 'verbose'

export type ConsoleColor = 'success' | 'error' | 'warning' | 'default'
