import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ManageReleaseConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/releases\/confirmation/,
      title: /Release (verified|updated|unscheduled) - DPS/,
      heading: /Release (verified|updated|unscheduled) for (.+?)/,
    })
  }
}
