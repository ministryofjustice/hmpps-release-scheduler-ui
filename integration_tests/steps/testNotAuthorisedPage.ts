import { Page } from '@playwright/test'
import auth from '../mockApis/hmppsAuth'
import { stubComponents } from '../mockApis/componentsApi'
import { NotAuthorisedPage } from '../pages/NotAuthorisedPage'
import { login } from '../testUtils'

export const testNotAuthorisedPage = async (
  page: Page,
  url: string,
  roles: string[] = ['ROLE_TRANSFER_SCHEDULER_RO'],
) => {
  await Promise.all([auth.stubSignInPage(), stubComponents()])
  await login(page, { roles })
  await page.goto(url)
  await new NotAuthorisedPage(page).verifyContent()
}
