import { RequiredEntityData } from '@mikro-orm/core'
import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { ClsService } from 'nestjs-cls'
import { getClientIp } from 'request-ip'
import { inspect } from 'util'
import { v4 as generateUUID } from 'uuid'
import { RequestEntity } from './entities/request.entity'
import { DEFAULT_HEADERS, REPLACE_SECRET_STRING, REQUEST_ID_KEY } from './logger.constants'
import { MODULE_OPTIONS_TOKEN } from './logger.definition'
import { ConsoleColor, NLoggerOptions } from './logger.interfaces'
import { NLoggerService } from './logger.service'

@Injectable()
export class NLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: NLoggerOptions,
    private readonly cls: ClsService,
    private readonly service: NLoggerService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const id = this.beforeRequest(req, res)

    res.on('finish', () => {
      this.afterRequest(req, res, id)
    })

    next()
  }

  private beforeRequest(req: Request, res: Response) {
    const id = generateUUID()
    this.cls.set(REQUEST_ID_KEY, id)

    this.any(req).timestamp = Date.now()
    res.send = this.responseBodyInterceptor(res, res.send)

    return id
  }

  private afterRequest(req: Request, res: Response, id: string) {
    const data = this.createRequestLog(id, req, res)

    if (data) {
      this.service.pushDatabaseItem({ type: 'request', data })

      const log = this.createConsoleLog(data)
      if (log) console.log(log)

      this.service.winston?.log(this.getRequestText(data), data)
    }
  }

  private createRequestLog(id: string, req: Request, res: Response) {
    try {
      const responseBody = this.isErrorResponse(res)
        ? this.safeJsonParse(this.any(res).contentBody)
        : null

      const log: RequiredEntityData<RequestEntity> = {
        id,
        method: req.method,
        path: req.path,
        params: req.params,
        query: this.hideProperties(req.query),
        body: this.hideProperties(req.body),
        headers: this.getHeaders(req),
        status: res.statusCode,
        error: res.statusCode >= 400 && res.statusCode <= 599,
        ip: getClientIp(req),
        responseBody: responseBody,
        timestamp: new Date(this.any(req).timestamp),
        executionTime: Date.now() - this.any(req).timestamp,
        userId: this.options.userIdExtractor?.(req, this.cls),
        customData: this.options.customDataExtractor?.(req, this.cls),
      }

      return log
    } catch (e) {
      console.error('Failed to create request log:', e)
      return null
    }
  }

  private createConsoleLog(data: RequiredEntityData<RequestEntity>) {
    try {
      const details: Record<string, any> = {
        params: data.params,
        query: data.query,
        body: data.body,
        headers: data.headers,
        ip: data.ip,
        responseBody: data.responseBody,
        userId: data.userId,
        timestamp: (data.timestamp as any)?.toString(),
        executionTime: `${data.executionTime}ms`,
        customData: data.customData,
      }

      this.clearEmptyValues(details)
      const detailsString = inspect(details, false, 8)
      const color = this.withColor(this.matchColorForStatus(data.status))
      const header = color(`[${data.method} ${data.path}] [${data.status}] [${data.id}]`)

      return `${header} ${detailsString}`
    } catch (e) {
      console.error('Failed to create console log:', e)
      return null
    }
  }

  private safeJsonParse(err: any): Record<string, any> {
    if (!err) return null

    try {
      if (typeof err === 'object') return { ...err }
      if (typeof err === 'string') return JSON.parse(err)
      return { raw: inspect(err, false, 5) }
    } catch (e) {
      return { raw: inspect(e, false, 5) }
    }
  }

  private isErrorResponse(res: Response) {
    return res.statusCode >= 400 && res.statusCode <= 599
  }

  private getHeaders(req: Request) {
    const headers = this.options.headers ?? DEFAULT_HEADERS

    const obj = headers.reduce((acc, next) => ({ ...acc, [next]: req.header(next) }), {})

    return this.clearEmptyValues(obj)
  }

  private responseBodyInterceptor(res: Response, send: Response['send']) {
    return (content: any) => {
      this.any(res).contentBody = content
      res.send = send
      return res.send(content)
    }
  }

  private clearEmptyValues(obj: Record<string, any>) {
    for (const [key, value] of Object.entries(obj)) {
      if (!value) delete obj[key]

      if (typeof value === 'object' && value !== null && !Object.keys(value).length) {
        delete obj[key]
      }
    }

    return obj
  }

  private any<T>(value: T): any {
    return value
  }

  private getRequestText(obj: RequiredEntityData<RequestEntity>) {
    const color = this.withColor(this.matchColorForStatus(obj.status))

    return color(`${obj.method?.toUpperCase()} ${obj.path} [${obj.status}]`)
  }

  private withColor(color: ConsoleColor) {
    const COLORS: Record<ConsoleColor, string> = {
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      default: '\x1b[0m',
    }

    return (text: string) => `${COLORS[color]}${text ?? ''}${COLORS.default}`
  }

  private matchColorForStatus(status: number): ConsoleColor {
    if (status >= 100 && status < 400) {
      return 'success'
    }

    if (status >= 400 && status < 500) {
      return 'warning'
    }

    if (status >= 500 && status < 600) {
      return 'error'
    }

    return 'default'
  }

  private hideProperties(obj: Record<string, any>) {
    if (!obj || typeof obj !== 'object') return obj

    for (const hidden of this.options.hiddenProperties ?? []) {
      if (obj[hidden]) {
        obj[hidden] = REPLACE_SECRET_STRING
      }
    }

    return obj
  }
}
