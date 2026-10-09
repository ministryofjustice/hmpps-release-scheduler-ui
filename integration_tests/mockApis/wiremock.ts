import superagent, { SuperAgentRequest, Response } from 'superagent'

const adminUrl = 'http://localhost:9091/__admin'

/**
 * Incomplete definition of options used for creating a new stub mapping
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Stub-Mappings/operation/createNewStubMapping
 */
interface Mapping {
  request?: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    queryParameters?: Record<string, { equalTo: string } | { matches: string }>
    bodyPatterns?: ({ contains: string } | { equalToJson: unknown })[]
  } & ({ url?: string } | { urlPath: string } | { urlPathPattern: string } | { urlPattern: string })
  response?: {
    status?: number
    headers?: Record<string, string>
  } & ({ jsonBody?: unknown } | { body: string } | { base64Body: string })
}

export const stubFor = (mapping: Mapping): SuperAgentRequest => superagent.post(`${adminUrl}/mappings`).send(mapping)

export const stubPing = (urlPrefix: string, httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `${urlPrefix}/health/ping`,
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

/**
 * Incomplete definition of options used for searching requests
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Requests/operation/findRequestsByCriteria
 */
type FindRequestCriteria = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
} & ({ url?: string } | { urlPath: string } | { urlPathPattern: string } | { urlPattern: string })

/**
 * Incomplete definition of requests found
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Requests/operation/findRequestsByCriteria
 */
interface FoundRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  url: string
  absoluteUrl: string
  headers: Record<string, string>
  queryParams: Record<string, { key: string; values: string[] }>
  body: string
  bodyAsBase64: string
}

export const getMatchingRequests = (body: FindRequestCriteria): Promise<FoundRequest[]> =>
  superagent
    .post(`${adminUrl}/requests/find`)
    .send(body)
    .then(data => data.body.requests)

export const resetStubs = (): Promise<Response[]> =>
  Promise.all([superagent.delete(`${adminUrl}/mappings`), superagent.delete(`${adminUrl}/requests`)])

export const successStub = ({
  method,
  urlPattern,
  url,
  response,
}: {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  urlPattern?: string
  url?: string
  response: unknown
}) =>
  stubFor({
    request: {
      method,
      ...(url ? { url } : {}),
      ...(urlPattern ? { urlPattern } : {}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export const getApiBody = async (urlPattern: string, method: string = 'POST'): Promise<object[]> => {
  const wiremockApiResponse: Response = await superagent.post(`${adminUrl}/requests/find`).send({ method, urlPattern })

  return (wiremockApiResponse.body || '[]').requests.map((itm: { body?: string }) => {
    return itm.body ? JSON.parse(itm.body) : undefined
  })
}

export const getAPICallCountMatching = async (urlPattern: string, method: string): Promise<number> => {
  const wiremockApiResponse: Response = await superagent.post(`${adminUrl}/requests/find`).send({ method, urlPattern })
  const responses = (wiremockApiResponse.body || '[]').requests
  return responses.length
}

export const getSentAuditEvents = async (): Promise<object[]> => {
  const wiremockApiResponse: Response = await superagent
    .post(`${adminUrl}/requests/find`)
    .send({ method: 'POST', urlPath: '/' })

  return (wiremockApiResponse.body || '[]').requests.map((itm: { body?: string }) => {
    if (!itm.body || !itm.body.includes('MessageBody')) {
      return undefined
    }
    return JSON.parse(JSON.parse(itm.body)['MessageBody'])
  })
}
