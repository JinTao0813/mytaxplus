import Link from 'next/link'

import { getProfile } from '@/lib/api'
import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { ProfileEditor } from './_components/profile-editor'

export default async function ProfilePage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const profile = await getProfile({ cookieHeader })

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
              Tax Profile Builder
            </h1>
            <p className="mt-2 text-base text-secondary">
              Review and refine your extracted financial data.
            </p>
          </div>
          <Link
            href="/chat"
            className="text-sm font-semibold text-secondary underline"
          >
            Open AI Assistant
          </Link>
        </div>

        <ProfileEditor initialProfile={profile} />
      </div>
    </div>
  )
}
