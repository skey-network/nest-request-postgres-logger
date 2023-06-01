export const REQUEST_ID_KEY = 'nlogger_req_id'

export const INTERVAL_KEY = 'nlogger_interval'

export const DEFAULT_SKIP_CONTEXTS = Object.freeze([
  'RouterExplorer',
  'InstanceLoader',
  'NestFactory',
  'NestApplication',
  'ClsModule',
  'RoutesResolver',
])

export const DEFAULT_HEADERS = Object.freeze(['user-agent', 'content-type'])

export const REPLACE_SECRET_STRING = '********'
