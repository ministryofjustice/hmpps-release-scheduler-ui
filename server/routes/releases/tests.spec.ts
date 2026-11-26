import { test, expect } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { ManageReleasePage } from './test.page'
import { login, resetStubs } from '../../../integration_tests/testUtils'
import { stubGetRelease, stubGetReleaseHistory } from '../../../integration_tests/mockApis/releaseSchedulerApi'
import { testPrisonerDetails, testUnverifiedRelease } from '../../../integration_tests/data/testData'
import { NotAuthorisedPage } from '../../../integration_tests/pages/NotAuthorisedPage'

test.describe('/releases/:id', () => {
  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetRelease(testUnverifiedRelease),
      stubGetReleaseHistory(testUnverifiedRelease.id, {
        content: [
          {
            domainEvents: ['person.release.scheduled'],
            occurredAt: '2001-01-01T09:05:00',
            user: { name: 'User Name', username: 'USERNAME' },
            changes: [],
          },
          {
            domainEvents: ['person.release.unverified'],
            occurredAt: '2001-01-01T09:15:00',
            user: { name: 'User Name', username: 'USERNAME' },
            changes: [
              // @ts-expect-error mistyped audit history changes
              { propertyName: 'confirmedReleaseDate', previous: '2001-01-01T09:30:00', change: '2001-01-02T10:00:00' },
            ],
          },
        ],
      }),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should show 403 error if prisoner is outside the user caseloads', async ({ page }) => {
    await stubGetPrisonerDetails({
      ...testPrisonerDetails,
      prisonId: 'OUT',
    })

    await login(page)
    await page.goto(`/releases/${testUnverifiedRelease.id}`)
    await new NotAuthorisedPage(page).verifyContent()
  })

  test('should show scheduled release and edit links', async ({ page }) => {
    await stubGetPrisonerDetails()

    await login(page)
    await page.goto(`/releases/${testUnverifiedRelease.id}`)

    // verify page content
    const testPage = await new ManageReleasePage(page).verifyContent({ readOnly: false })

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink(
      'Change confirmed release date',
      /\/releases\/start-edit\/unverified-release-id\/confirmedReleaseDate/,
    )
    await testPage.verifyLink('Change release reason', /\/releases\/start-edit\/unverified-release-id\/reason/)
    await testPage.verifyLink('Change comments', /\/releases\/start-edit\/unverified-release-id\/comments/)

    await expect(testPage.button('Verify release')).toBeVisible()
    await expect(testPage.button('Unschedule this release')).toBeVisible()

    // verify history tab
    await testPage.clickTab('Release history')

    await testPage.verifyHistoryEntry(
      /^Release scheduled$/,
      ['Release scheduled for Prisoner-Name Prisoner-Surname'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Release updated',
      [],
      ['Confirmed release date was changed from 1 January 2001 to 2 January 2001'],
    )
  })

  test('should show scheduled release for view only role and do not show edit links', async ({ page }) => {
    await stubGetPrisonerDetails()

    await login(page, { roles: ['ROLE_RELEASE_SCHEDULER_RO'] })
    await page.goto(`/releases/${testUnverifiedRelease.id}`)

    // verify page content
    const testPage = await new ManageReleasePage(page).verifyContent({ readOnly: true })

    await testPage.verifyAnswer('Auto release date', '2 January 2001')
    await testPage.verifyAnswer('Approved  release date', '1 January 2001')
    await testPage.verifyAnswer('Confirmed release date', '3 January 2001')
    await testPage.verifyAnswer('Release reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await expect(testPage.link('Change confirmed release date')).toHaveCount(0)
    await expect(testPage.link('Change release reason')).toHaveCount(0)
    await expect(testPage.link('Change comments')).toHaveCount(0)

    await expect(testPage.button('Verify release')).toHaveCount(0)
    await expect(testPage.button('Unschedule this release')).toHaveCount(0)

    // verify history tab
    await testPage.clickTab('Release history')

    await testPage.verifyHistoryEntry(
      /^Release scheduled$/,
      ['Release scheduled for Prisoner-Name Prisoner-Surname'],
      [],
    )
    await testPage.verifyHistoryEntry(
      'Release updated',
      [],
      ['Confirmed release date was changed from 1 January 2001 to 2 January 2001'],
    )
  })
})
