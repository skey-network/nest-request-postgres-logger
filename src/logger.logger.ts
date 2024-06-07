import { ConsoleLogger, Inject, Injectable } from '@nestjs/common'
import { inspect } from 'util'
import { DEFAULT_SKIP_CONTEXTS } from './logger.constants'
import { MODULE_OPTIONS_TOKEN } from './logger.definition'
import { LogType, NLoggerOptions } from './logger.interfaces'
import { NLoggerService } from './logger.service'

@Injectable()
export class NLogger extends ConsoleLogger {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly opts: NLoggerOptions,
    private readonly loggerService: NLoggerService,
  ) {
    super()
  }

  log(message: any, context?: string): void
  log(message: any, ...optionalParams: [...any, string?]): void
  log(message: any, ...optionalParams: any[]) {
    const { messages, context } = super['getContextAndMessagesToPrint']([
      message,
      ...optionalParams,
    ])

    this.pushToDb('log', context, messages)
    this.loggerService.winston?.log(message, ...optionalParams)

    super.log(message, ...optionalParams)
  }

  error(message: any, stackOrContext?: string): void
  error(message: any, stack?: string, context?: string): void
  error(message: any, ...optionalParams: [...any, string?, string?]): void
  error(message: any, ...optionalParams: any[]) {
    const { messages, context, stack } = super['getContextAndStackAndMessagesToPrint']([
      message,
      ...optionalParams,
    ])

    this.pushToDb('error', context, messages, stack)

    if (message instanceof Error) {
      this.loggerService.winston?.error(
        message.message,
        { stack: message.stack },
        ...optionalParams,
      )
    } else {
      this.loggerService.winston?.error(message, ...optionalParams)
    }

    super.error(message, ...optionalParams)
  }

  warn(message: any, context?: string): void
  warn(message: any, ...optionalParams: [...any, string?]): void
  warn(message: any, ...optionalParams: any[]) {
    const { messages, context } = super['getContextAndMessagesToPrint']([
      message,
      ...optionalParams,
    ])

    this.pushToDb('warn', context, messages)
    this.loggerService.winston?.warn(message, ...optionalParams)

    super.warn(message, ...optionalParams)
  }

  debug(message: any, context?: string): void
  debug(message: any, ...optionalParams: [...any, string?]): void
  debug(message: any, ...optionalParams: any[]) {
    const { messages, context } = super['getContextAndMessagesToPrint']([
      message,
      ...optionalParams,
    ])

    this.pushToDb('debug', context, messages)
    this.loggerService.winston?.debug(message, ...optionalParams)

    super.debug(message, ...optionalParams)
  }

  verbose(message: any, context?: string): void
  verbose(message: any, ...optionalParams: [...any, string?]): void
  verbose(message: any, ...optionalParams: any[]) {
    const { messages, context } = super['getContextAndMessagesToPrint']([
      message,
      ...optionalParams,
    ])

    this.pushToDb('verbose', context, messages)
    this.loggerService.winston?.verbose(message, ...optionalParams)

    super.verbose(message, ...optionalParams)
  }

  private pushToDb(type: LogType, context: any, messages: any, stack?: any) {
    if (!this.loggerService.databaseAvailable) return

    const blacklist = this.opts.skipContexts ?? DEFAULT_SKIP_CONTEXTS
    const ctx = this.getContext(context)

    if (blacklist.includes(ctx)) return

    const data = {
      type,
      context: this.getContext(context),
      data: this.getMessages(messages, stack),
    }

    this.loggerService.pushDatabaseItem({ type: 'log', data })
  }

  private getMessages(messages: any, stack?: any): string | null {
    const ins = (obj: any) => inspect(obj, false, 8)

    if (!messages && !stack) return null
    if (!stack) return ins(messages)

    if (Array.isArray(messages)) {
      return ins([...messages, stack])
    } else {
      return ins([messages, stack])
    }
  }

  private getContext(ctx: any): string | null {
    if (!ctx) return null
    if (typeof ctx === 'string') return ctx

    return inspect(ctx)
  }

  protected formatPid(pid: number) {
    if (!this.opts.logPrefix) {
      return super.formatPid(pid)
    }

    const prefix = `[${this.opts.logPrefix.slice(0, 12)}]`

    return prefix.padEnd(14, ' ') + ' - '
  }
}
