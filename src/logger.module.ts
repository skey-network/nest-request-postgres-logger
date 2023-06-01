import { DynamicModule, Inject, MiddlewareConsumer, NestModule } from '@nestjs/common'
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './logger.definition'
import { NLoggerOptions } from './logger.interfaces'
import { NLogger } from './logger.logger'
import { NLoggerMiddleware } from './logger.middleware'
import { NLoggerService } from './logger.service'

export class NLoggerModule extends ConfigurableModuleClass implements NestModule {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private readonly options: NLoggerOptions) {
    super()
  }

  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const base = super.forRoot(options)

    return {
      ...base,
      providers: [...(base.providers ?? []), NLoggerService, NLoggerMiddleware, NLogger],
    }
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return super.forRootAsync(options)
  }

  configure(consumer: MiddlewareConsumer) {
    if (this.options.mountMiddleware ?? true) {
      consumer.apply(NLoggerMiddleware).forRoutes('*')
    }
  }
}
