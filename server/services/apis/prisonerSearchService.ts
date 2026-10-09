import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { HmppsUser } from '@ministryofjustice/hmpps-prison-permissions-lib/dist/types/internal/user/HmppsUser'
import Prisoner from './model/prisoner'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'

export default class PrisonerSearchApiService {
  private prisonerSearchApiClient: CustomRestClient

  constructor(
    protected readonly authenticationClient: AuthenticationClient,
    private readonly prisonPermissionsService: PermissionsService,
  ) {
    this.prisonerSearchApiClient = new CustomRestClient(
      'Prison Offender Search API',
      config.apis.prisonerSearchApi,
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

  async getPrisonerDetails(
    context: ApiRequestContext,
    prisonerNumber: string,
    throwExceptionOnNoPermission: boolean = false,
  ): Promise<Prisoner> {
    const prisoner = await this.prisonerSearchApiClient
      .withContext(context)
      .get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })

    const permission = this.prisonPermissionsService.getPrisonerPermissions({
      user: context.res.locals.user as HmppsUser,
      prisoner,
      requestDependentOn: [],
    })

    if (permission['prisoner:base-record:read']) return prisoner

    if (throwExceptionOnNoPermission) throw new Error('No permission')

    return {
      ...prisoner,
      prisonName: '',
      cellLocation: '',
      dateOfBirth: '',
    }
  }

  async searchPrisoner(context: ApiRequestContext, searchTerm: string): Promise<Prisoner[]> {
    return (
      await this.prisonerSearchApiClient.withContext(context).get<{ content: Prisoner[] }>({
        path: `/prison/${context.res.locals.user.getActiveCaseloadId()}/prisoners?size=10&term=${encodeURIComponent(searchTerm)}`,
      })
    ).content
  }
}
