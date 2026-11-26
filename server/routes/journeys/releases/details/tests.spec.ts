import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ManageReleaseEditDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import {
  stubGetReasons,
  stubGetRelease,
  stubGetReleaseHistory,
  stubPutRelease,
} from '../../../../../integration_tests/mockApis/releaseSchedulerApi'
import { testUnverifiedRelease } from '../../../../../integration_tests/data/testData'
import { getApiBody } from '../../../../../integration_tests/mockApis/wiremock'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

test.describe('/releases/details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/releases/details`)
  })
})

test.describe('/releases/details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetReasons(),
      stubGetRelease(testUnverifiedRelease),
      stubGetReleaseHistory(testUnverifiedRelease.id, { content: [] }),
      stubPutRelease(testUnverifiedRelease.id, {
        content: [
          {
            domainEvents: [],
            user: { username: '', name: '' },
            occurredAt: '',
            changes: [
              {
                propertyName: 'confirmedReleaseDate',
              },
              {
                propertyName: 'reason',
              },
              {
                propertyName: 'comments',
              },
            ],
          },
        ],
      }),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/releases/start-edit/${testUnverifiedRelease.id}/details`)
  }

  test('should enter release details and proceed to check answers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ManageReleaseEditDetailsPage(page).verifyContent()

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')

    await expect(testPage.dateField()).toHaveValue('3/1/2001')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')

    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.dateField().clear()
    await testPage.reasonInput().fill('')
    await page.keyboard.press('Escape')
    await testPage.commentsField().fill('n'.repeat(251))
    await testPage.clickButton('Save')
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
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/releases\/unverified-release-id/)

    expect(await getApiBody(`/release-scheduler-api/releases/${testUnverifiedRelease.id}`, 'PUT')).toContainEqual({
      actions: [
        {
          type: 'UnverifyRelease',
          confirmedReleaseDate: expect.any(String),
          reasonCode: 'R1',
          comments: 'Lorem ipsum',
        },
      ],
    })

    await expect(page.getByText('Confirmed release date, release reason and comments changed')).toBeVisible()
  })
})
