import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ManageReleaseUnschedulePage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import {
  stubGetRelease,
  stubGetReleaseHistory,
  stubPutRelease,
} from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testUnverifiedRelease } from '../../../../../integration_tests/data/testData'
import { getApiBody, getAPICallCountMatching } from '../../../../../integration_tests/mockApis/wiremock'

test.describe('/releases/unschedule unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/releases/unschedule`)
  })
})

test.describe('/releases/unschedule', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetRelease(testUnverifiedRelease),
      stubGetReleaseHistory(testUnverifiedRelease.id, { content: [] }),
      stubPutRelease(testUnverifiedRelease.id),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/releases/start-edit/${testUnverifiedRelease.id}/unschedule`)
  }

  test('should unschedule a release and proceed to confirmation', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ManageReleaseUnschedulePage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()

    await expect(testPage.reasonField()).not.toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select if you want to unschedule this release').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await expect(testPage.reasonField()).toBeVisible()
    await expect(testPage.reasonField()).toHaveValue('')
    await testPage.reasonField().fill('lorem ipsum')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/releases\/confirmation/)

    expect(await getApiBody(`/release-scheduler-api/releases/${testUnverifiedRelease.id}`, 'PUT')).toContainEqual({
      actions: [{ type: 'UnscheduleRelease' }],
      reason: 'lorem ipsum',
    })
  })

  test('should confirm not to unschedule release and return to release details page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ManageReleaseUnschedulePage(page).verifyContent()

    // verify next page routing
    await testPage.noRadio().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/releases\/unverified-release-id/)

    // verify no API call made
    expect(await getAPICallCountMatching(`/release-scheduler-api/releases/${testUnverifiedRelease.id}`, 'PUT')).toEqual(
      0,
    )
  })
})
