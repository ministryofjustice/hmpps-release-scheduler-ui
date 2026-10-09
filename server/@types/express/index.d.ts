import { HmppsUser } from '../../interfaces/hmppsUser'
import { Prisoner } from '../../services/apis/model/prisoner'
import { PrisonerDetails, JourneyData } from '../journeys'
import { Breadcrumbs } from '../../middleware/history/breadcrumbs'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      journeyData: JourneyData

      middleware?: {
        prisonerData?: Prisoner
      }
    }

    interface Response {
      notFound(): void
      notAuthorised(): void
      conflict(): void
      getPageViewEvent(isAttempt: boolean): AuditEvent
      setAuditDetails: {
        prisonNumber(prisonNumber: string): void
        searchTerm(searchTerm: string): void
        suppress(suppress: boolean): void
      }
      sendApiEvent?: (apiUrl: string, isAttempt: boolean) => void
    }

    interface Locals {
      user: HmppsUser
      digitalPrisonServicesUrl: string
      externalMovementsUrl: string
      prisonerProfileUrl: string
      cspNonce: string
      csrfToken: string
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
      feComponents?: {
        sharedData?: {
          activeCaseLoad: CaseLoad
          caseLoads: CaseLoad[]
          services: {
            id: string
            heading: string
            description: string
            href: string
            navEnabled: boolean
          }[]
        }
      }
      auditEvent: {
        who: string
        correlationId: string
        subjectId?: string
        subjectType?: string
        suppress?: boolean
        details?: {
          activeCaseLoadId?: string
          pageUrl: string
          pageName?: Page
          query?: string
          [key: string]: unknown
        }
      }
      formResponses?: Record<string, unknown>
      prisonerDetails?: PrisonerDetails
      appInsightsConnectionString?: string
      appInsightsApplicationName?: string
      buildNumber?: string
      breadcrumbs: Breadcrumbs
      historyBackUrl?: string
      history?: string[]
    }
  }
}
