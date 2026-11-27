import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ManageReleaseConfirmationPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetRelease, stubPutRelease } from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testUnverifiedRelease } from '../../../../../integration_tests/data/testData'
import { ManageReleaseVerifyPage } from '../verify/test.page'
import { ManageReleaseUnschedulePage } from '../unschedule/test.page'

test.describe('/releases/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `${uuidV4()}/releases/confirmation`)
  })
})

test.describe('/releases/confirmation', () => {
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

  const startJourney = async (page: Page, journeyId: string, property: string) => {
    await page.goto(`/${journeyId}/releases/start-edit/${testUnverifiedRelease.id}/${property}`)
  }

  test('should show confirmation for verifying a release', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, 'verify')

    const verifyPage = await new ManageReleaseVerifyPage(page).verifyContent()
    await verifyPage.verifyCheckbox().click()
    await verifyPage.verifyButton().click()

    // verify page content
    const testPage = await new ManageReleaseConfirmationPage(page).verifyContent()

    await expect(page.getByText('Release verified for Prisoner-Name Prisoner-Surname')).toBeVisible()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Schedule or manage another release ', '/')
  })

  test('should show confirmation for unscheduling a release', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId, 'unschedule')

    const unschedulePage = await new ManageReleaseUnschedulePage(page).verifyContent()
    await unschedulePage.yesRadio().click()
    await unschedulePage.clickContinue()

    // verify page content
    const testPage = await new ManageReleaseConfirmationPage(page).verifyContent()

    await expect(page.getByText('Release unscheduled for Prisoner-Name Prisoner-Surname')).toBeVisible()
    await testPage.verifyLink('Schedule or manage another release ', '/')
  })
})
