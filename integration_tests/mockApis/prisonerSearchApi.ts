import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'
import { testPrisonerDetails } from '../data/testData'
import Prisoner from '../../server/services/apis/model/prisoner'

export const stubPrisonerSearchPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetPrisonerDetails = (params?: Partial<typeof testPrisonerDetails>) => {
  const prisoner = {
    ...testPrisonerDetails,
    ...(params ?? {}),
  }
  return successStub({
    method: 'GET',
    urlPattern: `/prisoner-search-api/prisoner/${prisoner.prisonerNumber}`,
    response: prisoner,
  })
}

export const stubSearchPrisoner = (caseload: string, query: string, response: { content: Prisoner[] }) =>
  successStub({
    method: 'GET',
    urlPattern: `/prisoner-search-api/prison/${caseload}/prisoners\\?${query}`,
    response,
  })

export const stubSearchPrisonerFail = (caseload: string, query: string) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prisoner-search-api/prison/${caseload}/prisoners\\?${query}`,
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { userMessage: 'Stubbed API error returned' },
    },
  })
