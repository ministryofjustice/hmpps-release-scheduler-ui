import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleReleaseCheckAnswersPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import {
  stubGetRelease,
  stubGetReasons,
  stubPutRelease,
} from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testPendingRelease } from '../../../../../integration_tests/data/testData'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/schedule-a-release/check-answers unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-release/check-answers')
  })
})

test.describe('/schedule-a-release/check-answers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetReasons(),
      stubGetRelease(testPendingRelease),
      stubPutRelease(testPendingRelease.id),
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
        confirmedReleaseDate: '2001-01-03',
        reason: { code: 'R1', description: 'Reason One' },
        comments: 'Lorem ipsum',
      },
    })
    await page.goto(`/${journeyId}/schedule-a-release/check-answers`)
  }

  test('should check answers and confirm to schedule a release', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleReleaseCheckAnswersPage(page).verifyContent()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Change confirmed release date', /details#confirmedReleaseDate/)
    await testPage.verifyLink('Change release reason', /details#reason/)
    await testPage.verifyLink('Change comments', /details#comments/)

    // verify next page routing
    await testPage.clickButton('Schedule release')
    expect(page.url()).toMatch(/\/schedule-a-release\/confirmation/)
  })
})
