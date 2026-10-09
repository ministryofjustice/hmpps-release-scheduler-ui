import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { dataAccess } from '../data'
import AuditService from './auditService'
import config from '../config'
import { createRedisClient } from '../data/redisClient'
import RedisCache from '../data/cache/redisCache'
import CacheInterface from '../data/cache/cacheInterface'
import InMemoryCache from '../data/cache/inMemoryCache'
import logger from '../../logger'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import PrisonApiService from './apis/prisonApiService'
import { populatePrisonerDetails } from '../middleware/permissions/populatePrisonerDetails'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const redisClient = config.redis.enabled ? createRedisClient() : null

  const cacheStore = <T>(prefix: string): CacheInterface<T> =>
    redisClient ? new RedisCache<T>(redisClient, prefix) : new InMemoryCache<T>(prefix)

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: hmppsAuthClient,
    logger,
    telemetryClient: telemetry,
  })

  const prisonerSearchService = new PrisonerSearchApiService(hmppsAuthClient, prisonPermissionsService)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    prisonApiService: new PrisonApiService(hmppsAuthClient, prisonerSearchService),
    prisonerSearchService,
    cacheStore,
    populatePrisonerMiddleware: populatePrisonerDetails(prisonPermissionsService),
  }
}

export type Services = ReturnType<typeof services>
