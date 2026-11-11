import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { ManageReleaseController } from './controller'
import { Page } from '../../services/auditService'

export const ManageReleaseRoutes = ({ populateReleaseMiddleware }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new ManageReleaseController()

  get('/:id', Page.MANAGE_RELEASE, populateReleaseMiddleware({ withHistory: true }), controller.GET)

  return router
}
