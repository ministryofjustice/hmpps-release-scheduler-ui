import { test, Page, expect } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleReleaseConfirmationPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetRelease, stubGetReasons } from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testPendingRelease, testUnverifiedRelease } from '../../../../../integration_tests/data/testData'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/schedule-a-release/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-release/confirmation')
  })
})

test.describe('/schedule-a-release/confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetReasons(),
      stubGetRelease(testPendingRelease),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/schedule-a-release/start/${testPendingRelease.id}`)
    await injectJourneyData(page, journeyId, {
      scheduleRelease: {
        backUrl: 'backUrl',
        release: testPendingRelease,
        result: testUnverifiedRelease,
        confirmedReleaseDate: '2001-01-03',
        reason: { code: 'R1', description: 'Reason One' },
        comments: 'Lorem ipsum',
      },
    })
    await page.goto(`/${journeyId}/schedule-a-release/confirmation`)
  }

  test('should show confirmation of scheduled release', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleReleaseConfirmationPage(page).verifyContent()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await expect(testPage.button('Verify this release')).toBeVisible()
    await expect(testPage.button('Verify this release')).toHaveAttribute(
      'href',
      /\/releases\/start-edit\/unverified-release-id\/verify/,
    )
    await testPage.verifyLink('Schedule or manage another release ', /backUrl/)
  })
})
