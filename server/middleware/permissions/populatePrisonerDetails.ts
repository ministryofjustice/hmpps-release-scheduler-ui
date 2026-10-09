import {
  PermissionsService,
  PrisonerBasePermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Request, Response, NextFunction } from 'express'
import Prisoner from '../../services/apis/model/prisoner'
import { PrisonerDetails } from '../../@types/journeys'

export const populatePrisonerDetails = (prisonPermissionsService: PermissionsService) => [
  prisonerPermissionsGuard(prisonPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonNumber'] as string,
  }),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.prisonerDetails = toPrisonerDetails(req.middleware!.prisonerData!)
    next()
  },
]

export const toPrisonerDetails = (prisoner: Prisoner): PrisonerDetails => ({
  prisonerNumber: prisoner.prisonerNumber,
  lastName: prisoner.lastName,
  firstName: prisoner.firstName,
  dateOfBirth: prisoner.dateOfBirth,
  prisonName: prisoner.prisonName,
  cellLocation: prisoner.cellLocation,
})
