import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ManageReleaseVerifyPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/releases\/verify/,
      title: 'Check release details - Schedule and manage releases - DPS',
      caption: 'Schedule and manage releases',
      heading: 'Check release details',
    })
  }

  verifyCheckbox() {
    return this.checkbox('Check the box to confirm details are correct and this release can be verified.')
  }

  verifyButton() {
    return this.button('Verify release')
  }
}
