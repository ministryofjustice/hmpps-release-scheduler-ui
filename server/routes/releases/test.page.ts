import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class ManageReleasePage extends BaseTestPage {
  async verifyContent({ readOnly }: { readOnly: boolean }) {
    return readOnly
      ? this.verify({
          pageUrl: /\/releases\/(\w|-)+/,
          title: 'View scheduled release - View release schedules - DPS',
          caption: /View release schedules/,
          heading: /View .+ scheduled release/,
        })
      : this.verify({
          pageUrl: /\/releases\/(\w|-)+/,
          title: 'Manage scheduled release - Schedule and manage releases - DPS',
          caption: /Schedule and manage releases/,
          heading: /Manage .+ scheduled release/,
        })
  }

  async verifyHistoryEntry(heading: string | RegExp, contents: (string | RegExp)[], changes: (string | RegExp)[]) {
    const headingElement = this.page.getByRole('heading', { name: heading })
    await expect(headingElement).toBeVisible()

    const entryElement = headingElement.locator('../..')

    for (const content of contents) {
      await expect(entryElement.getByText(content)).toBeVisible()
    }

    if (changes.length) await entryElement.getByText('View update details').click()
    for (const change of changes) {
      await expect(entryElement.getByText(change)).toBeVisible()
    }
  }
}
