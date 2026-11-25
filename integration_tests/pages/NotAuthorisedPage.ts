import { BaseTestPage } from './baseTestPage'

export class NotAuthorisedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /.+/,
      title: 'Not authorised - DPS',
      heading: 'You do not have permission to access this page',
    })
  }
}
