import { stubFor } from './wiremock'

export const stubComponentsFail = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/components/components.*',
    },
    response: {
      status: 500,
    },
  })
}

export const stubComponents = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/components/components.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        meta: {
          caseLoads: [
            {
              caseLoadId: 'LEI',
              description: 'Leeds (HMP)',
              currentlyActive: true,
            },
          ],
          activeCaseLoad: {
            caseLoadId: 'LEI',
            description: 'Leeds (HMP)',
            currentlyActive: true,
          },
          services: [
            {
              id: 'release-scheduler',
            },
          ],
        },
        header: {
          html: '',
          css: [''],
          javascript: [''],
        },
        footer: {
          html: '',
          css: [''],
          javascript: [],
        },
      },
    },
  })
}
