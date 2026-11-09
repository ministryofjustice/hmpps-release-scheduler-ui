import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import ReleaseSchedulerService from '../services/apis/releaseSchedulerService'
import { components } from '../@types/releaseSchedulerApi'
import { ResQuerySchemaType } from './schema'
import { setPaginationLocals } from '../views/partials/simplePagination/utils'
import { getApiUserErrorMessage } from '../utils/utils'
import { formatInputDate } from '../utils/dateTimeUtils'

export class HomepageSearchReleasesController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  private PAGE_SIZE = 50

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    if (resQuery.searchTerm?.trim()) {
      res.setAuditDetails.searchTerm(resQuery.searchTerm.trim())
    }

    let searchResponse: components['schemas']['ReleaseSearchResponse'] | undefined
    let results: components['schemas']['ReleaseSummary'][] = []

    try {
      if (resQuery.validated) {
        const requestBody: components['schemas']['ReleaseSearchRequest'] = {
          page: resQuery.validated.page || 1,
          size: this.PAGE_SIZE,
          statusCodes: ['PENDING', 'UNVERIFIED', 'VERIFIED'],
        }
        if (resQuery.validated.searchTerm) {
          requestBody.query = resQuery.validated.searchTerm
        } else {
          requestBody.start = resQuery.validated.start
          requestBody.end = resQuery.validated.end

          if (resQuery.validated.status?.length) {
            requestBody.statusCodes = resQuery.validated.status
          }
        }

        searchResponse = await this.releaseSchedulerService.searchReleases({ res }, requestBody)
        results = searchResponse?.content ?? []
      }

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        resQuery?.validated?.page ?? 1,
        searchResponse?.metadata?.totalElements ?? 0,
        results.length,
        `?page={page}&${[
          `searchTerm=${resQuery?.searchTerm ?? ''}`,
          `start=${resQuery?.start ?? ''}`,
          `end=${resQuery?.end ?? ''}`,
          // eslint-disable-next-line no-nested-ternary
          ...(Array.isArray(resQuery?.status)
            ? resQuery.status.map(itm => `status=${itm}`)
            : resQuery.status
              ? [`status=${resQuery.status}`]
              : []),
        ].join('&')}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('view', {
      showBreadcrumbs: true,
      hasValidationError: !resQuery.validated,
      results,
      searchTerm: resQuery.searchTerm,
      start: resQuery.validated?.start ? formatInputDate(resQuery.validated.start) : resQuery.start,
      end: resQuery.validated?.end ? formatInputDate(resQuery.validated.end) : resQuery.end,
      status: resQuery.status,
    })
  }
}
