<div>
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>
<br>

## Nest request postgres logger

Features:

- Logs request data to terminal
- Saves requests and logs to postgres db
- You can hide secret properties like passwords etc.
- Choose request headers you want to display and save
- Saved logs are matched with their request
- You can attach user id and custom data to request logs
- Uses its own schema in postgres

Requirements:

- `nestjs-cls`
- `@nestjs/schedule`
- postgres database

<br>

## Minimal setup

Install the library with peer dependencies

```bash
npm install @nestjs/schedule nestjs-cls nest-request-postgres-logger
```

Add nest logger module

```typescript
// app.module.ts

import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ClsModule } from 'nestjs-cls'
import { NLoggerModule } from 'nest-request-postgres-logger'

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    ScheduleModule.forRoot(),
    NLoggerModule.forRoot({
      connection: {
        host: 'localhost',
        port: 5432,
        dbName: 'postgres',
        user: 'postgres',
        password: 'password',
      },
    }),
  ],
})
export class AppModule {}
```

Replace default nest logger

```typescript
// main.ts

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NLogger } from 'nest-request-postgres-logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(app.get(NLogger))

  await app.listen(3000)
}

bootstrap()
```

<br>

## Configuration

```typescript
export interface NLoggerOptions {
  /**
   * Mikro orm connection config
   * https://mikro-orm.io/api/5.6/core/interface/MikroORMOptions
   *
   * Some properties are overridden by logger
   */
  dbConfig: DbConfig

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
   * Interval in milliseconds indicating how often batch of logs is saved in db
   *
   * Defaults to 3000
   */
  dbUpdateInterval?: number
}
```
