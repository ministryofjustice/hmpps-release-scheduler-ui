import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleReleaseConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-release\/confirmation/,
      title: 'Release scheduled - DPS',
      heading: /Release scheduled for (.+?)/,
    })
  }
}
