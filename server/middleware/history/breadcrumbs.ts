import type { Request, Response, NextFunction, RequestHandler } from 'express'

export type Breadcrumb = { href: string; text: string; alias?: string }

export class Breadcrumbs {
  breadcrumbs: Breadcrumb[]

  constructor(res: Response) {
    this.breadcrumbs = [
      {
        text: 'Digital Prison Services',
        href: res.locals.digitalPrisonServicesUrl,
      },
      {
        text: 'External movements',
        href: res.locals.externalMovementsUrl,
      },
    ]
  }

  popLastItem(): Breadcrumb | undefined {
    return this.breadcrumbs.pop()
  }

  addItems(...items: Breadcrumb[]): void {
    for (const item of items) {
      const existingIndex = this.breadcrumbs.findIndex(o => o.alias === item.alias)
      if (existingIndex === -1) {
        this.breadcrumbs.push(item)
      } else {
        this.breadcrumbs.splice(existingIndex, 1, item)
      }
    }
  }

  get items(): readonly Breadcrumb[] {
    return [...this.breadcrumbs]
  }

  fromAlias(alias: string) {
    return this.breadcrumbs.find(o => o.alias === alias)
  }

  last() {
    return this.breadcrumbs[this.breadcrumbs.length - 1]
  }
}

export default function breadcrumbs(): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.locals.breadcrumbs = new Breadcrumbs(res)
    next()
  }
}
