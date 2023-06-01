import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'logs', schema: 'nlogger' })
export class LogEntity extends BaseEntity<LogEntity, 'id'> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string

  @Property({ type: 'text' })
  type: string

  @Property({ type: 'text', nullable: true })
  context: string

  @Property({ type: 'text', nullable: true })
  data: string

  @Property({ type: 'uuid', nullable: true, index: true })
  requestId: string
}
