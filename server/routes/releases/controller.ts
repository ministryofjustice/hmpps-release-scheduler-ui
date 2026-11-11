import { Request, Response } from 'express'
import { parseAuditHistory } from '../../views/partials/auditHistory/parseAuditHistory'

export class ManageReleaseController {
  GET = async (req: Request, res: Response) => {
    if (!['UNVERIFIED', 'VERIFIED'].includes(req.middleware!.release!.status.code)) {
      return res.notFound()
    }

    return res.render('releases/view', {
      showBreadcrumbs: true,
      release: req.middleware!.release,
      auditedActions: parseAuditHistory(
        req.middleware!.auditHistory!.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      ),
    })
  }
}
