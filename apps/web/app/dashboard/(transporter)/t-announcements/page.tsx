"use client";

import { MegaphoneIcon, PlusIcon, InfoCircleIcon } from "@/app/dashboard/_Components/Icons";
import { Page, Reveal, PageHeader, EmptyState, PrimaryButton } from "@/app/dashboard/_Components/ui";

export default function TransporterAnnouncementsPage() {
  return (
    <Page>
      <PageHeader
        kicker="Broadcasts"
        title="Announcements"
        subtitle="Share updates, delays, or important info with travelers who booked your routes."
        action={
          <PrimaryButton icon={<PlusIcon className="w-4 h-4" />}>
            New announcement
          </PrimaryButton>
        }
      />

      <Reveal className="mb-6">
        <div className="flex gap-3 p-4 rounded-2xl bg-blue-50/70 ring-1 ring-blue-100">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <InfoCircleIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-blue-900">Reach travelers instantly</p>
            <p className="text-[12px] text-blue-800/80 mt-0.5">
              Target all travelers or specific routes. They'll see your message in their announcements feed.
            </p>
          </div>
        </div>
      </Reveal>

      <EmptyState
        title="No announcements yet"
        description="Create your first broadcast to share updates with travelers across your routes."
        icon={<MegaphoneIcon className="w-6 h-6" />}
      />
    </Page>
  );
}
