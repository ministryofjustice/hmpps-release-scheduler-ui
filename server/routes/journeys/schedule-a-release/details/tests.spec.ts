import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleReleaseDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetRelease, stubGetReasons } from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { testPendingRelease } from '../../../../../integration_tests/data/testData'

test.describe('/schedule-a-release/details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-release/details')
  })
})

test.describe('/schedule-a-release/details', () => {
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
    await page.goto(`/${journeyId}/schedule-a-release/details`)
  }

  test('should enter release details and proceed to check answers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleReleaseDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await page.getByText('View calculated release dates').click()
    await testPage.verifyAnswer('Approved Parole Date', '3 January 2001')

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(251))
    await testPage.clickContinue()
    await testPage.link('Enter or select a confirmed release date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a reason for this release').click()
    await expect(testPage.reasonInput()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 250').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/schedule-a-release\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
  })
})
