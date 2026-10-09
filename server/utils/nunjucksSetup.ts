/* eslint-disable no-param-reassign */
import path from 'path'
// @ts-expect-error no type for Moj frontend filters
import MojFilter from '@ministryofjustice/frontend/moj/filters/all'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { formatDate } from 'date-fns'
import {
  addSelectValue,
  fromCodedDescription,
  getQueryEntries,
  initialiseName,
  prisonerProfileBacklink,
  setCheckedValue,
  setSelectedValue,
} from './utils'
import config from '../config'
import logger from '../../logger'
import { historyExtension } from '../middleware/history/historyExtension'
import { formatFromInputDate, inputDate } from './dateTimeUtils'
import {
  firstNameSpaceLastName,
  formatRefDataName,
  lastNameCommaFirstName,
  possessiveComma,
  sentenceCase,
} from './formatUtils'
import {
  buildErrorSummaryList,
  customErrorOrderBuilder,
  findError,
  findErrorMessage,
} from '../middleware/validation/validationMiddleware'
import { hasPermissionFilter } from '../middleware/permissions/requirePermissions'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Schedule a release for a prisoner'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  app.use((_req, res, next) => {
    res.locals.digitalPrisonServicesUrl = config.serviceUrls.digitalPrison
    res.locals.prisonerProfileUrl = config.serviceUrls.prisonerProfile
    res.locals.externalMovementsUrl = config.serviceUrls.externalMovements
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/routes'),
      path.join(__dirname, '../../server/routes/journeys'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
      noCache: process.env.NODE_ENV !== 'production',
    },
  )

  njkEnv.addExtension('HistoryExtension', historyExtension)

  // date and mojDate filters required by mojTimeline component
  const { date, mojDate } = MojFilter()
  njkEnv.addFilter('date', date)
  njkEnv.addFilter('mojDate', mojDate)

  njkEnv.addGlobal('inputDate', inputDate)
  njkEnv.addGlobal('prisonerProfileBacklink', prisonerProfileBacklink)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('lastNameCommaFirstName', lastNameCommaFirstName)
  njkEnv.addFilter('possessiveComma', possessiveComma)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('formatRefDataName', formatRefDataName)
  njkEnv.addFilter('getQueryEntries', getQueryEntries)

  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatFromInputDate', formatFromInputDate)

  njkEnv.addFilter('fromCodedDescription', fromCodedDescription)
  njkEnv.addFilter('addSelectValue', addSelectValue)
  njkEnv.addFilter('setSelectedValue', setSelectedValue)
  njkEnv.addFilter('setCheckedValue', setCheckedValue)
  njkEnv.addFilter('removeNullish', arr => arr.filter(Boolean))

  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('findErrorMessage', findErrorMessage)
  njkEnv.addFilter('buildErrorSummaryList', buildErrorSummaryList)
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('hasPermission', hasPermissionFilter)

  njkEnv.addFilter(
    'showChangeLinksIf',
    (items: { key: unknown; value: unknown; actions: unknown }[], condition: boolean) =>
      condition ? items : items.map(({ actions, ...item }) => item),
  )

  njkEnv.addFilter('isArray', Array.isArray)
}
