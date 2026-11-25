import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'
import { components } from '../../server/@types/releaseSchedulerApi'

export const stubReleaseSchedulerPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/release-scheduler-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubSearchReleases = (response: components['schemas']['ReleaseSearchResponse']) =>
  successStub({
    method: 'POST',
    urlPattern: '/release-scheduler-api/search/prisons/LEI/releases',
    response,
  })
