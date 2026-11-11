import { components } from '../releaseSchedulerApi'

export interface PrisonerDetails {
  prisonerNumber: string
  lastName: string
  firstName: string
  dateOfBirth: string
  prisonName?: string | undefined
  cellLocation?: string | undefined
  prisonId?: string
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisonerDetails?: PrisonerDetails
  scheduleRelease?: ScheduleReleaseJourney
  isCheckAnswers?: boolean
  journeyCompleted?: boolean
  b64History?: string | undefined
  stateGuard?: boolean
}

export type CodedDescription = {
  code: string
  description: string
  hintText?: string
}

type ScheduleReleaseJourney = {
  backUrl: string
  release: components['schemas']['ReleaseDetail']
} & Partial<{
  confirmedReleaseDate: string
  reason: CodedDescription
  comments: string | null
  result: components['schemas']['AuditHistory']
}>
