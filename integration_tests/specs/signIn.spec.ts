import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs } from '../testUtils'
import { stubComponentsFail } from '../mockApis/componentsApi'
import tokenVerification from '../mockApis/tokenVerification'

test.describe('SignIn', () => {
  test.beforeEach(async () => {
    await stubComponentsFail()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User name visible in header', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    await expect(page.getByTestId('header-user-name')).toContainText('A. Testuser')
  })

  test('User can sign out', async ({ page }) => {
    await login(page)
    await page.getByTestId('signOut').click()
    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await login(page, { active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  // TODO: enable token clear test after user role check is implemented
  test.skip('Token verification failure clears user session', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('heading', { name: 'Sign in' })).not.toBeAttached()

    await tokenVerification.stubVerifyToken(false)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await tokenVerification.stubVerifyToken(true)
    await login(page, { name: 'Another Tester', roles: ['INVALID_ROLE'] })

    await expect(page.getByText('You are not authorised to use this application')).toBeVisible()
  })
})
