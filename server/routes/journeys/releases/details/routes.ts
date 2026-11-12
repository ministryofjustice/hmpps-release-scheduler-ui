import { Services } from '../../../../services'
import { UpdateReleaseDetailsController } from './controller'
import { BaseRouter } from '../../../common/routes'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from '../../schedule-a-release/details/schema'

export const UpdateReleaseDetailsRoutes = ({ releaseSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new UpdateReleaseDetailsController(releaseSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(releaseSchedulerService)), controller.submitToApi, controller.POST)

  return router
}
