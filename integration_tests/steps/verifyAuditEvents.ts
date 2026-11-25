import { expect } from '@playwright/test'
import { getSentAuditEvents } from '../mockApis/wiremock'

export const verifyAuditEvents = async (events: object[]) =>
  expect(await getSentAuditEvents()).toEqual(expect.arrayContaining(events))
