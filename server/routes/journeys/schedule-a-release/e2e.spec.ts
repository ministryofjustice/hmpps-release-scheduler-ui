import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { testPendingRelease } from '../../../../integration_tests/data/testData'
import {
  stubGetRelease,
  stubGetReasons,
  stubPutRelease,
} from '../../../../integration_tests/mockApis/releaseSchedulerApi'
import { ScheduleReleaseCheckAnswersPage } from './check-answers/test.page'
import { ScheduleReleaseConfirmationPage } from './confirmation/test.page'
import { ScheduleReleaseDetailsPage } from './details/test.page'
import { verifyAuditEvents } from '../../../../integration_tests/steps/verifyAuditEvents'

test.describe('/schedule-a-release e2e ', () => {
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

  test('should create new scheduled release', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/schedule-a-release/start/${testPendingRelease.id}`)

    // fill in all pages
    const detailsPage = await new ScheduleReleaseDetailsPage(page).verifyContent()
    await detailsPage.dateField().fill('31/12/2047')
    await detailsPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await detailsPage.clickContinue()

    const checkAnswersPage = await new ScheduleReleaseCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Confirmed release date', '31 December 2047')
    await checkAnswersPage.verifyAnswer('Release reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Comments', 'Not provided')

    // verify changing answers
    await checkAnswersPage.clickLink('Change confirmed release date')
    await detailsPage.dateField().fill('30/12/2047')
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Confirmed release date', '30 December 2047')

    await checkAnswersPage.clickLink('Change release reason')
    await detailsPage.reasonInput().clear()
    await detailsPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change comments')
    await detailsPage.commentsField().fill('Lorem ipsum')
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Comments', 'Lorem ipsum')

    // proceed to confirmation
    await checkAnswersPage.clickButton('Schedule release')

    await new ScheduleReleaseConfirmationPage(page).verifyContent()

    expect(await getApiBody(`/release-scheduler-api/releases/${testPendingRelease.id}`, 'PUT')).toContainEqual({
      actions: [
        { type: 'ScheduleRelease', confirmedReleaseDate: '2047-12-30', reasonCode: 'R2', comments: 'Lorem ipsum' },
      ],
    })

    await verifyAuditEvents([
      {
        what: 'API_CALL_SUCCESS',
        subjectType: 'NOT_APPLICABLE',
        details: '{"apiUrl":"PUT /releases/pending-release-id","activeCaseLoadId":"LEI"}',
        service: 'hmpps-release-scheduler-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })
})
