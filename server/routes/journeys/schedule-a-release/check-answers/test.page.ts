import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleReleaseCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-release\/check-answers/,
      title: 'Check release details - Schedule and manage releases - DPS',
      caption: 'Schedule and manage releases',
      heading: 'Check release details',
      backUrl: /details/,
    })
  }
}
