import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'requests', schema: 'nlogger' })
export class RequestEntity extends BaseEntity<RequestEntity, 'id'> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string

  @Property({ type: 'text' })
  method: string

  @Property({ type: 'text' })
  path: string

  @Property({ type: 'jsonb' })
  params: Record<string, any>

  @Property({ type: 'jsonb' })
  query: Record<string, any>

  @Property({ type: 'jsonb' })
  body: Record<string, any>

  @Property({ type: 'jsonb' })
  headers: Record<string, any>

  @Property({ type: 'integer' })
  status: number

  @Property({ type: 'boolean' })
  error: boolean

  @Property({ type: 'text', nullable: true })
  ip?: string

  @Property({ type: 'jsonb', nullable: true })
  responseBody?: Record<string, any>

  @Property({ type: 'timestamp' })
  timestamp: Date

  @Property({ type: 'int' })
  executionTime: number

  @Property({ type: 'jsonb', nullable: true })
  customData: Record<string, any>

  @Property({ type: 'uuid', nullable: true })
  userId?: string
}
