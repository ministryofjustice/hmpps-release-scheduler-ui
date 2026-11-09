import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components, operations } from '../../@types/releaseSchedulerApi'
import { CodedDescription } from '../../@types/journeys'

export default class ReleaseSchedulerService {
  private restClient: CustomRestClient

  constructor(protected readonly authenticationClient: AuthenticationClient) {
    this.restClient = new CustomRestClient(
      'Release Scheduler API',
      config.apis.releaseSchedulerApi,
      logger,
      authenticationClient,
      false,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  searchReleases(context: ApiRequestContext, request: components['schemas']['ReleaseSearchRequest']) {
    return this.restClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['ReleaseSearchResponse']>({
        path: `/search/prisons/${context.res.locals.user.getActiveCaseloadId()}/releases`,
        data: request,
      })
  }

  async getReferenceData(
    context: ApiRequestContext,
    domain: operations['getDomain']['parameters']['path']['domain'],
  ): Promise<CodedDescription[]> {
    return (
      await this.restClient
        .withContext(context)
        .get<components['schemas']['ReferenceDataResponse']>({ path: `/reference-data/${domain}` })
    ).items
  }
}
