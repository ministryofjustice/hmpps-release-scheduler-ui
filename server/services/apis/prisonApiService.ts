import { Readable } from 'stream'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import PrisonerSearchApiService from './prisonerSearchService'

export default class PrisonApiService {
  private prisonApiClient: RestClient

  constructor(
    protected readonly authenticationClient: AuthenticationClient,
    private readonly prisonerSearchApiService: PrisonerSearchApiService,
  ) {
    this.prisonApiClient = new RestClient('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  async getPrisonerImage({ res }: ApiRequestContext, prisonNumber: string): Promise<Readable> {
    // check whether user has permission to get prisoner photo, and throw exception if not
    await this.prisonerSearchApiService.getPrisonerDetails({ res }, prisonNumber, true)

    return this.prisonApiClient.stream(
      { path: `/api/bookings/offenderNo/${prisonNumber}/image/data` },
      asSystem(res.locals.user.username),
    )
  }
}
