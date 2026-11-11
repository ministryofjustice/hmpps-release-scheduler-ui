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
    heading: 'Migrated',
    content: 'Release migrated from NOMIS',
    skipUser: true,
  },
  'person.release.scheduled': {
    heading: 'Scheduled',
    content: 'Release scheduled for <prisoner>',
  },
}

const CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  start: 'Start date and time',
  reason: 'Reason',
  comments: 'Comments',
  destinationCode: 'Destination',
  logistics: 'Escort details',
  priority: 'Priority',
  requestedOn: 'Request date',
}

const parseChangedPropertyValue = (domain: string, property: string, value: unknown, _referenceData: ReferenceData) => {
  if (!value) return 'Not applicable'

  if (domain.endsWith('comments-changed') && property === 'comments') return `“${value}”`

  if (domain.endsWith('date-range-changed') && ['start', 'end'].includes(property)) return formatDate(String(value))

  if (domain.endsWith('rescheduled') && ['start', 'end'].includes(property))
    return formatDate(String(value), `d MMMM yyyy 'at' HH:mm`)

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
