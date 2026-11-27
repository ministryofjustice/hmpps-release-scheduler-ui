import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ManageReleaseUnschedulePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/releases\/unschedule/,
      title: 'Are you sure you want to unschedule this release - Schedule and manage releases - DPS',
      caption: 'Schedule and manage releases',
      heading: 'Are you sure you want to unschedule this release?',
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }

  reasonField() {
    return this.textbox('Enter any comments (optional)')
  }
}
