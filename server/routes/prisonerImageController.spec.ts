import { test, expect } from '@playwright/test'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../integration_tests/testUtils'
import auth from '../../integration_tests/mockApis/hmppsAuth'
import { getAPICallCountMatching } from '../../integration_tests/mockApis/wiremock'
import { stubGetPrisonerDetails } from '../../integration_tests/mockApis/prisonerSearchApi'

test.describe('prisoner image', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents()])
    await login(page, { name: 'A TestUser' })
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should get prisoner image', async ({ page }) => {
    const prisonNumber = 'A1001AA'
    await stubGetPrisonerDetails({ prisonerNumber: prisonNumber })

    await page.goto(`/prisoner-image/${prisonNumber}`)

    expect(
      await getAPICallCountMatching(`/prison-api/api/bookings/offenderNo/${prisonNumber}/image/data`, 'GET'),
    ).toEqual(1)
  })

  test('should not get prisoner image if it is outside caseload', async ({ page }) => {
    const prisonNumber = 'B2002BB'
    await stubGetPrisonerDetails({ prisonerNumber: prisonNumber, prisonId: 'OUTSIDE' })

    await page.goto(`/prisoner-image/${prisonNumber}`)

    expect(
      await getAPICallCountMatching(`/prison-api/api/bookings/offenderNo/${prisonNumber}/image/data`, 'GET'),
    ).toEqual(0)
  })
})
