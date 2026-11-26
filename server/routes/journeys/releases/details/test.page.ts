import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ManageReleaseEditDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/releases\/details/,
      title: 'Edit release details - Schedule and manage releases - DPS',
      caption: 'Schedule and manage releases',
      heading: 'Edit release details',
    })
  }

  dateField() {
    return this.textbox(/What is (.+?)’s confirmed release date\?/)
  }

  reasonInput() {
    return this.dropdown(/What is (.+?)’s release reason\?/)
  }

  commentsField() {
    return this.textbox('Add any comments for this release (optional)')
  }
}
