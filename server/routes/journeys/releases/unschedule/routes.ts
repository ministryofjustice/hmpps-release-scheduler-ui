import { UnscheduleReleaseController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const UnscheduleReleaseRoutes = ({ releaseSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new UnscheduleReleaseController(releaseSchedulerService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
