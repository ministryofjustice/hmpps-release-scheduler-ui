import { formatDate } from '../../../utils/dateTimeUtils'
import { CodedDescription } from '../../../@types/journeys'

type Change = {
  propertyName: string
  previous?: (string | number | boolean) | null
  change?: (string | number | boolean) | null
}

type User = {
  username: string
  name: string
}

type AuditedAction = {
  user: User
  /** Format: date-time */
  occurredAt: string
  domainEvents: string[]
  reason?: string | null
  changes: Change[]
}

type DomainEventText = {
  heading: string
  content?: string
  reasonRequested?: boolean
  changes?: string[]
  skipUser?: boolean
}
type ReferenceData = { prisons: CodedDescription[] }

const DOMAIN_EVENT_MAP: { [key: string]: DomainEventText } = {
  'person.release.migrated': {
    heading: 'Release migrated',
    content: 'Release migrated from NOMIS',
    skipUser: true,
  },
  'person.release.scheduled': {
    heading: 'Release scheduled',
    content: 'Release scheduled for <prisoner>',
  },
  'person.release.unverified': {
    heading: 'Release updated',
  },
  'person.release.verified': {
    heading: 'Release verified',
    content: 'Release verified for <prisoner>',
  },
  'person.release.unscheduled': {
    heading: 'Release unscheduled',
    content: 'Release unscheduled for <prisoner>',
    reasonRequested: true,
  },
}

const CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  confirmedReleaseDate: 'Confirmed release date',
  reason: 'Release reason',
  comments: 'Comments',
}

const parseChangedPropertyValue = (
  _domain: string,
  property: string,
  value: unknown,
  _referenceData: ReferenceData,
) => {
  if (!value) return 'Not applicable'

  if (property === 'comments') return `“${value}”`

  if (property === 'confirmedReleaseDate') return formatDate(String(value))

  return String(value)
}

export const parseAuditHistory = (history: AuditedAction[], referenceData: ReferenceData = { prisons: [] }) =>
  history
    .flatMap(action =>
      action.domainEvents.map(event => {
        const eventText = DOMAIN_EVENT_MAP[event]
        if (!eventText) return null

        const changes = !eventText.content
          ? action.changes
              .filter(({ propertyName }) => CHANGE_PROPERTY_MAP[propertyName])
              .map(change => {
                return `${CHANGE_PROPERTY_MAP[change.propertyName] ?? change.propertyName} ${change.propertyName === 'comments' ? 'were' : 'was'} changed from ${parseChangedPropertyValue(event, change.propertyName, change.previous, referenceData)} to ${parseChangedPropertyValue(event, change.propertyName, change.change, referenceData)}.`
              })
              .filter(itm => Boolean(itm))
          : null

        const cancellationReason = action.changes.find(
          ({ propertyName }) => propertyName === 'cancellationReason',
        )?.change

        return {
          ...eventText,
          reason: [cancellationReason, action.reason].filter(Boolean).join('\n'),
          user: eventText.skipUser ? null : action.user,
          occurredAt: action.occurredAt,
          ...(changes ? { changes } : {}),
        }
      }),
    )
    .filter(itm => Boolean(itm))
