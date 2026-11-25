import { Page } from '@playwright/test'
import { JourneyData } from '../../server/@types/journeys'

export const injectJourneyData = async (page: Page, uuid: string, journeyData: Partial<JourneyData>) => {
  const data = encodeURIComponent(btoa(JSON.stringify(journeyData)))
  await page.goto(`/${uuid}/inject-journey-data?data=${data}`)
}
