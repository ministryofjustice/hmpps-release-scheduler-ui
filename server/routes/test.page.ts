import { BaseTestPage } from '../../integration_tests/pages/baseTestPage'

export class HomePage extends BaseTestPage {
  async verifyContent({ readOnly }: { readOnly: boolean }) {
    return readOnly
      ? this.verify({
          pageUrl: /localhost:3007\/\?/,
          title: '11 results found: Search for releases - View release schedules - DPS',
          caption: 'View release schedules',
          heading: /Search for releases/,
        })
      : this.verify({
          pageUrl: /localhost:3007\/\?/,
          title: '11 results found: Search for releases - Schedule and manage releases - DPS',
          caption: 'Schedule and manage releases',
          heading: /Search for releases/,
        })
  }

  searchField() {
    return this.textbox(/Enter prisoner name or prison number/)
  }

  startDateField() {
    return this.textbox('Date from')
  }

  endDateField() {
    return this.textbox('Date to')
  }
}
