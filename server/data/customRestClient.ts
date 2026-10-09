import { Response as ExpressResponse } from 'express'
import Logger from 'bunyan'
import { Response as SuperAgentResponse } from 'superagent'
import { AgentConfig, asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RequestWithBody, Request } from '@ministryofjustice/hmpps-rest-client/dist/main/types/Request'

interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export type ApiRequestContext = {
  res: ExpressResponse
  readOnly?: boolean
}

export default class CustomRestClient extends RestClient {
  constructor(
    name: string,
    config: ApiConfig,
    logger: Logger | Console,
    authenticationClient?: AuthenticationClient | undefined,
    private readonly audited: boolean = false,
    private readonly retryHandler:
      ((retry?: boolean) => (err: Error, res: SuperAgentResponse) => boolean | undefined) | undefined = undefined,
  ) {
    super(name, config, logger, authenticationClient)
  }

  handleApiRequest<Resp, ErrorData>(apiRequest: Request<Resp, ErrorData>, res: ExpressResponse) {
    const headers: { [key: string]: string } = { ...(apiRequest.headers ?? {}) }
    if (res?.locals?.user?.activeCaseLoad?.caseLoadId) {
      headers['CaseloadId'] = res.locals.user.activeCaseLoad.caseLoadId
    }

    return {
      ...apiRequest,
      headers,
      ...(this.retryHandler ? { retryHandler: this.retryHandler } : {}),
    } as Request<SuperAgentResponse, ErrorData> // cast to SuperAgentResponse to work around typecheck bug
  }

  sendAuditEvent(apiUrl: string, res: ExpressResponse, isAttempt: boolean) {
    if (!this.audited) return
    if (!res.sendApiEvent) throw new Error(`Missing audit event handler for ${apiUrl}`)
    res.sendApiEvent(apiUrl, isAttempt)
  }

  withContext({ res, readOnly }: ApiRequestContext) {
    return {
      get: async <Response, ErrorData = unknown>(apiRequest: Request<Response, ErrorData>) => {
        return (await super.get(this.handleApiRequest(apiRequest, res), asSystem(res.locals.user.username))) as Response
      },
      patch: async <Response, ErrorData = unknown>(apiRequest: RequestWithBody<Response, ErrorData>) => {
        this.sendAuditEvent(`PATCH ${apiRequest.path}`, res, true)
        const result = (await super.patch(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as Response
        this.sendAuditEvent(`PATCH ${apiRequest.path}`, res, false)
        return result
      },
      put: async <Response, ErrorData = unknown>(apiRequest: RequestWithBody<Response, ErrorData>) => {
        this.sendAuditEvent(`PUT ${apiRequest.path}`, res, true)
        const result = (await super.put(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as Response
        this.sendAuditEvent(`PUT ${apiRequest.path}`, res, false)
        return result
      },
      post: async <Response, ErrorData = unknown>(apiRequest: RequestWithBody<Response, ErrorData>) => {
        if (!readOnly) this.sendAuditEvent(`POST ${apiRequest.path}`, res, true)
        const result = (await super.post(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as Response
        if (!readOnly) this.sendAuditEvent(`POST ${apiRequest.path}`, res, false)
        return result
      },
      delete: async <Response, ErrorData = unknown>(apiRequest: Request<Response, ErrorData>) => {
        this.sendAuditEvent(`DELETE ${apiRequest.path}`, res, true)
        const result = (await super.delete(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as Response
        this.sendAuditEvent(`DELETE ${apiRequest.path}`, res, false)
        return result
      },
    }
  }
}
