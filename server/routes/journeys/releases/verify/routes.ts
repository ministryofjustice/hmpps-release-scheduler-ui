import { VerifyReleaseController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const VerifyReleaseRoutes = ({ releaseSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new VerifyReleaseController(releaseSchedulerService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
