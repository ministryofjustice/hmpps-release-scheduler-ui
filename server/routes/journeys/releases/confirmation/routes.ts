import { UpdateReleaseConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const UpdateReleaseConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new UpdateReleaseConfirmationController()

  get('/', controller.GET)

  return router
}
