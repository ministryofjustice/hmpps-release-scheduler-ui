import { Page, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { deserialiseHistory } from '../../server/middleware/history/historyMiddleware'

export class BaseTestPage {
  constructor(public readonly page: Page) {}

  async verify({
    pageUrl,
    title,
    heading,
    caption,
    backUrl,
  }: {
    pageUrl: RegExp
    title: string | RegExp
    heading: string | RegExp
    caption?: string | RegExp
    backUrl?: RegExp
  }) {
    expect(this.stripHistoryParam(this.page.url())).toMatch(pageUrl)
    expect(await this.page.title()).toMatch(title)
    await expect(this.page.locator('h1')).toContainText(heading)
    if (caption) {
      await expect(this.page.locator('.govuk-caption-l')).toContainText(caption)
    }
    if (backUrl) {
      const url = await this.page.getByRole('link', { name: /^Back$/ }).getAttribute('href')
      expect(this.stripHistoryParam(url!)).toMatch(backUrl)
    }

    const accessibilityScanResults = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['aria-allowed-attr']) // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
      .analyze()
    expect(accessibilityScanResults.violations).toHaveLength(0)
    return this
  }

  async clickLink(name: string | RegExp) {
    await this.link(name).click()
  }

  async clickButton(name: string | RegExp, nth?: number) {
    if (nth === undefined) {
      await this.button(name).click()
    } else {
      await this.button(name).nth(nth).click()
    }
  }

  continueButton() {
    return this.button('Continue')
  }

  async clickContinue() {
    await this.continueButton().click()
  }

  async clickTab(name: string | RegExp) {
    await this.page.getByRole('tab', { name }).click()
  }

  button(name: string | RegExp, exact: boolean = false) {
    return this.page.getByRole('button', { name, exact })
  }

  radio(name: string | RegExp) {
    return this.page.getByRole('radio', { name })
  }

  link(name: string | RegExp) {
    return this.page.getByRole('link', { name })
  }

  textbox(name: string | RegExp) {
    return this.page.getByRole('textbox', { name })
  }

  checkbox(name: string | RegExp) {
    return this.page.getByRole('checkbox', { name })
  }

  dropdown(name: string | RegExp) {
    return this.page.getByRole('combobox', { name })
  }

  async verifyTableRow(idx: number, content: (string | RegExp)[], tableSelector: string = '.govuk-table') {
    const row = this.page.locator(tableSelector).locator('tr').nth(idx)
    await expect(row).toBeVisible()
    for (let i = 0; i < content.length; i += 1) {
      await expect(row.locator('td').nth(i)).toContainText(content[i]!)
    }
  }

  async verifyAnswer(heading: string | RegExp, value: string | RegExp) {
    const rowHeading = this.page.locator('dt', { hasText: heading }).nth(0)
    await expect(rowHeading).toBeVisible()
    await expect(rowHeading.locator('//following-sibling::dd').first()).toContainText(value)
  }

  async verifyAnswerNotVisible(heading: string | RegExp) {
    const rowHeading = this.page.locator('dt', { hasText: heading })
    await expect(rowHeading).not.toBeVisible()
  }

  historyParam(url: string, history: RegExp[]) {
    const actualUrl = new URL(url)
    const b64History = actualUrl.searchParams.get('history')
    const actualHistory = deserialiseHistory(b64History as string)

    for (let i = 0; i < history.length; i += 1) {
      expect(actualHistory[i]).toMatch(history[i]!)
    }
  }

  async verifyLink(text: string | RegExp, href: string | RegExp) {
    const url = await this.link(text).getAttribute('href')
    expect(url).not.toBeNull()
    expect(this.stripHistoryParam(url!)).toMatch(href)
  }

  private stripHistoryParam(url: string) {
    const actualUrl = new URL(
      url.startsWith('http') ? url : `http://localhost:3000${url.startsWith('/') ? url : `/${url}`}`,
    )
    actualUrl.searchParams.delete('history')
    const hash = url.split('#')[1]
    return (
      url.split('?')[0]! +
      (actualUrl.searchParams.size ? '?' : '') +
      actualUrl.searchParams.toString() +
      (hash ? `#${hash}` : '')
    )
  }
}
