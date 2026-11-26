import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ManageReleaseVerifyPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetRelease, stubPutRelease } from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testUnverifiedRelease } from '../../../../../integration_tests/data/testData'
import { getApiBody } from '../../../../../integration_tests/mockApis/wiremock'

test.describe('/releases/verify unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/releases/verify`)
  })
})

test.describe('/releases/verify', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetRelease(testUnverifiedRelease),
      stubPutRelease(testUnverifiedRelease.id),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/releases/start-edit/${testUnverifiedRelease.id}/verify`)
  }

  test('should enter release details and proceed to check answers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ManageReleaseVerifyPage(page).verifyContent()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await expect(testPage.verifyCheckbox()).not.toBeChecked()
    await expect(testPage.verifyButton()).toBeDisabled()

    // verify next page routing
    await testPage.verifyCheckbox().click()
    await expect(testPage.verifyButton()).not.toBeDisabled()
    await testPage.verifyButton().click()

    expect(page.url()).toMatch(/\/releases\/confirmation/)

    expect(await getApiBody(`/release-scheduler-api/releases/${testUnverifiedRelease.id}`, 'PUT')).toContainEqual({
      actions: [{ type: 'VerifyRelease' }],
    })
  })
})
