import { stubFor } from './wiremock'

export const stubPrisonApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

export const stubGetPrisonerImage = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/bookings/offenderNo/([a-zA-Z0-9]*)/image/data',
    },
    response: {
      status: 404,
    },
  })
}

export const stubGetOneCaseLoad = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads\\?allCaseloads=true',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
        },
      ],
    },
  })
}

export const stubGetCaseloadsNoneActive = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads\\?allCaseloads=true',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          currentlyActive: false,
          caseLoadId: 'LEI',
        },
      ],
    },
  })
}

export const stubGetCaseLoadsFail = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads\\?allCaseloads=true',
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { message: 'fail' },
    },
  })
}
