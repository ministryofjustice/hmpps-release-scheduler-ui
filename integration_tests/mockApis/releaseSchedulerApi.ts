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

export const stubGetRelease = (response: components['schemas']['ReleaseDetail']) =>
  successStub({
    method: 'GET',
    urlPattern: `/release-scheduler-api/releases/${response.id}`,
    response,
  })

export const stubGetReleaseHistory = (releaseId: string, response: components['schemas']['AuditHistory']) =>
  successStub({
    method: 'GET',
    urlPattern: `/release-scheduler-api/releases/${releaseId}/history`,
    response,
  })

export const stubGetReasons = () =>
  successStub({
    method: 'GET',
    urlPattern: '/release-scheduler-api/reference-data/release-reason',
    response: {
      items: [
        {
          code: 'R1',
          description: 'Reason One',
        },
        {
          code: 'R2',
          description: 'Reason Two',
        },
      ],
    },
  })

export const stubPutRelease = (
  releaseId: string,
  response: components['schemas']['AuditHistory'] = {
    content: [
      {
        user: { username: 'USERNAME', name: 'User Name' },
        occurredAt: '2025-12-01T17:50:20.421301',
        domainEvents: ['person.transfer.scheduled'],
        changes: [{ propertyName: '' }],
      },
    ],
  },
) =>
  successStub({
    method: 'PUT',
    urlPattern: `/release-scheduler-api/releases/${releaseId}`,
    response,
  })
