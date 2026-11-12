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
  updateRelease?: UpdateReleaseJourney
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
  result: components['schemas']['ReleaseDetail']
}>

type UpdateReleaseJourney = {
  backUrl: string
  release: components['schemas']['ReleaseDetail']
  historyQuery: string
} & Partial<{
  confirmedReleaseDate: string
  reason: CodedDescription
  comments: string | null
  unscheduleReason: string | null
  result: components['schemas']['ReleaseDetail']
  updateType: 'details' | 'unschedule' | 'verify'
}>
