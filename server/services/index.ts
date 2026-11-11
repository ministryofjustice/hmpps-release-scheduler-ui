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
import ReleaseSchedulerService from './apis/releaseSchedulerService'
import { populateRelease } from '../middleware/permissions/populateRelease'

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

  const releaseSchedulerService = new ReleaseSchedulerService(hmppsAuthClient)
  const prisonerSearchService = new PrisonerSearchApiService(hmppsAuthClient, prisonPermissionsService)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    prisonApiService: new PrisonApiService(hmppsAuthClient, prisonerSearchService),
    releaseSchedulerService,
    prisonerSearchService,
    populateReleaseMiddleware: populateRelease(releaseSchedulerService, prisonerSearchService),
    cacheStore,
    populatePrisonerMiddleware: populatePrisonerDetails(prisonPermissionsService),
  }
}

export type Services = ReturnType<typeof services>
