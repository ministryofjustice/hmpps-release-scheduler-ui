import { components } from '../../server/@types/releaseSchedulerApi'

export const testPrisonerDetails = {
  prisonerNumber: 'A9965EA',
  bookingId: '1223167',
  bookNumber: '59862A',
  firstName: 'PRISONER-NAME',
  lastName: 'PRISONER-SURNAME',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  youthOffender: false,
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'LEI',
  lastPrisonId: 'LEI',
  prisonName: 'Leeds (HMP)',
  cellLocation: '2-1-005',
  aliases: [],
  alerts: [
    {
      alertType: 'L',
      alertCode: 'LCE',
      active: true,
      expired: false,
    },
  ],
  legalStatus: 'REMAND',
  imprisonmentStatus: 'RECEP_REM',
  imprisonmentStatusDescription: 'On remand (reception)',
  convictedStatus: 'Remand',
  recall: false,
  indeterminateSentence: false,
  receptionDate: '2024-11-26',
  locationDescription: 'Leeds (HMP)',
  restrictedPatient: false,
  currentIncentive: {
    level: {
      code: 'STD',
      description: 'Standard',
    },
    dateTime: '2024-11-26T14:12:29',
    nextReviewDate: '2025-02-26',
  },
  addresses: [],
  emailAddresses: [],
  phoneNumbers: [],
  identifiers: [],
  allConvictedOffences: [],
}

export const testPendingRelease: components['schemas']['ReleaseDetail'] = {
  id: 'pending-release-id',
  approvedReleaseDate: '2001-01-01',
  autoReleaseDate: '2001-01-02',
  calculatedDates: [
    {
      type: 'APD',
      category: 'ApprovedReleaseDate',
      date: '2001-01-03',
    },
  ],
  person: {
    identifier: testPrisonerDetails.prisonerNumber,
    firstName: testPrisonerDetails.firstName,
    lastName: testPrisonerDetails.lastName,
  },
  status: { code: 'PENDING', description: 'Awaiting details' },
}

export const testUnverifiedRelease: components['schemas']['ReleaseDetail'] = {
  id: 'unverified-release-id',
  approvedReleaseDate: '2001-01-01',
  autoReleaseDate: '2001-01-02',
  confirmedReleaseDate: '2001-01-03',
  reason: { code: 'R1', description: 'Reason One' },
  comments: 'Lorem ipsum',
  calculatedDates: [
    {
      type: 'APD',
      category: 'ApprovedReleaseDate',
      date: '2001-01-03',
    },
  ],
  person: {
    identifier: testPrisonerDetails.prisonerNumber,
    firstName: testPrisonerDetails.firstName,
    lastName: testPrisonerDetails.lastName,
  },
  status: { code: 'UNVERIFIED', description: 'Unverified' },
}
