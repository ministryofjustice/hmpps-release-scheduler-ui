import { expect, test } from '@playwright/test'
import auth from '../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../integration_tests/mockApis/prisonerSearchApi'
import { stubSearchReleases } from '../../integration_tests/mockApis/releaseSchedulerApi'
import { login } from '../../integration_tests/testUtils'
import { resetStubs } from '../../integration_tests/mockApis/wiremock'
import { HomePage } from './test.page'
import { verifyAuditEvents } from '../../integration_tests/steps/verifyAuditEvents'

test.describe('/scheduled-transfers', () => {
  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubSearchReleases({
        metadata: { totalElements: 11 },
        content: [
          {
            id: 'release-1',
            person: {
              identifier: 'A9965EA',
              firstName: 'PRISONER-NAME',
              lastName: 'PRISONER-SURNAME',
            },
            status: { code: 'UNVERIFIED', description: 'Unverified' },
            autoReleaseDate: '2001-01-01',
            approvedReleaseDate: '2001-01-02',
            confirmedReleaseDate: '2001-01-03',
          },
          {
            id: 'release-2',
            person: {
              identifier: 'A1123EA',
              firstName: 'NAME',
              lastName: 'ANOTHER',
            },
            status: { code: 'PENDING', description: 'Awaiting details' },
            autoReleaseDate: '2001-01-01',
            approvedReleaseDate: '2001-01-02',
          },
        ],
      }),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should show search transfers page', async ({ page }) => {
    await login(page)
    await page.goto('?start=01/01/2001&end=31/01/2001&page=2')

    // verify page content
    const testPage = await new HomePage(page).verifyContent({ readOnly: false })

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')
    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('1/1/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('31/1/2001')

    await expect(testPage.link('Prisoner-Surname, Prisoner-Name - A9965EA').first()).toBeVisible()
    await expect(page.locator('strong', { hasText: 'Auto date' }).nth(0).locator('..')).toContainText('1 January 2001')
    await expect(page.locator('strong', { hasText: 'Approved date' }).nth(0).locator('..')).toContainText(
      '2 January 2001',
    )
    await expect(page.locator('strong', { hasText: 'Confirmed date' }).nth(0).locator('..')).toContainText(
      '3 January 2001',
    )
    await expect(testPage.link('View release for Prisoner-Surname, Prisoner-Name')).toHaveAttribute(
      'href',
      /\/releases\/release-1/,
    )

    await expect(testPage.link('Another, Name - A1123EA').first()).toBeVisible()
    await expect(page.locator('strong', { hasText: 'Auto date' }).nth(1).locator('..')).toContainText('1 January 2001')
    await expect(page.locator('strong', { hasText: 'Approved date' }).nth(1).locator('..')).toContainText(
      '2 January 2001',
    )
    await expect(page.locator('strong', { hasText: 'Confirmed date' }).nth(1).locator('..')).toContainText('No data')
    await expect(testPage.link('View release for Another, Name')).toHaveAttribute(
      'href',
      /\/schedule-a-release\/start\/release-2/,
    )

    // verify validation error
    await testPage.endDateField().fill('2/2/2001')
    await testPage.clickButton('Apply')
    await testPage.link('Enter a date range less than 31 days').click()
    await expect(testPage.endDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view releases.')).toBeVisible()

    // verify searching by prison number clears date filter
    await testPage.searchField().fill('test')
    await testPage.clickButton('Search')
    await expect(testPage.searchField()).toHaveValue('test')
    await expect(testPage.startDateField()).toHaveValue('')
    await expect(testPage.endDateField()).toHaveValue('')

    await verifyAuditEvents([
      {
        what: 'PAGE_VIEW',
        subjectType: 'SEARCH_TERM',
        subjectId: 'test',
        details: expect.stringContaining(`"pageName":"HOMEPAGE","query":"test","activeCaseLoadId":"LEI"`),
        service: 'hmpps-release-scheduler-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })

  test('should show search transfers page for read-only role', async ({ page }) => {
    await login(page, { roles: ['ROLE_RELEASE_SCHEDULER_RO'] })
    await page.goto('?start=01/01/2001&end=31/01/2001&page=2')

    // verify page content
    const testPage = await new HomePage(page).verifyContent({ readOnly: true })

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')
    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('1/1/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('31/1/2001')

    await expect(testPage.link('Prisoner-Surname, Prisoner-Name - A9965EA').first()).toBeVisible()
    await expect(page.locator('strong', { hasText: 'Auto date' }).nth(0).locator('..')).toContainText('1 January 2001')
    await expect(page.locator('strong', { hasText: 'Approved date' }).nth(0).locator('..')).toContainText(
      '2 January 2001',
    )
    await expect(page.locator('strong', { hasText: 'Confirmed date' }).nth(0).locator('..')).toContainText(
      '3 January 2001',
    )
    await expect(testPage.link('View release for Prisoner-Surname, Prisoner-Name')).toHaveAttribute(
      'href',
      /\/releases\/release-1/,
    )

    await expect(testPage.link('Another, Name - A1123EA').first()).toBeVisible()
    await expect(page.locator('strong', { hasText: 'Auto date' }).nth(1).locator('..')).toContainText('1 January 2001')
    await expect(page.locator('strong', { hasText: 'Approved date' }).nth(1).locator('..')).toContainText(
      '2 January 2001',
    )
    await expect(page.locator('strong', { hasText: 'Confirmed date' }).nth(1).locator('..')).toContainText('No data')
    await expect(testPage.link('View release for Another, Name')).toHaveCount(0)

    // verify validation error
    await testPage.endDateField().fill('2/2/2001')
    await testPage.clickButton('Apply')
    await testPage.link('Enter a date range less than 31 days').click()
    await expect(testPage.endDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view releases.')).toBeVisible()

    // verify searching by prison number clears date filter
    await testPage.searchField().fill('test')
    await testPage.clickButton('Search')
    await expect(testPage.searchField()).toHaveValue('test')
    await expect(testPage.startDateField()).toHaveValue('')
    await expect(testPage.endDateField()).toHaveValue('')
  })
})
