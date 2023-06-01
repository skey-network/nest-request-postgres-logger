import { ConfigurableModuleBuilder } from '@nestjs/common'
import { NLoggerOptions } from './logger.interfaces'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<NLoggerOptions>()
    .setClassMethodName('forRoot')
    .setFactoryMethodName('forRootAsync')
    .setExtras({ global: true }, (definition, extras) => ({ ...definition, global: extras.global }))
    .build()
