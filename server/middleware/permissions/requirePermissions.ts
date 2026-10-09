import { NextFunction, Request, Response } from 'express'
import { HmppsUser, UserPermissionLevel } from '../../interfaces/hmppsUser'

const PERMISSION_MAP = {
  VIEW: UserPermissionLevel.VIEW_ONLY,
  MANAGE: UserPermissionLevel.MANAGE,
}

export const requirePermissions =
  (permissionLevel: UserPermissionLevel) => (_req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.permission >= permissionLevel) {
      return next()
    }

    return res.render('pages/service-not-authorised')
  }

export const hasPermissionFilter = (user: HmppsUser, permissionLevel: 'VIEW' | 'MANAGE') =>
  user.permission >= PERMISSION_MAP[permissionLevel]
