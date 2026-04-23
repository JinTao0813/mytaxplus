import type { DashboardStatus } from '@/lib/types'
import { MOCK_DASHBOARD_STATUS } from '@/lib/mock-data'
import { apiFetch } from '@/lib/api/client'
import { USE_API_MOCK, type ServerApiContext } from '@/lib/api/config'
import { dashboardStatusSchema } from '@/lib/validations/api-schemas'

/** GET /api/v1/dashboard */
export async function getDashboardStatus(
  ctx?: ServerApiContext
): Promise<DashboardStatus> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/dashboard', {
      responseSchema: dashboardStatusSchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  return dashboardStatusSchema.parse(MOCK_DASHBOARD_STATUS)
}
