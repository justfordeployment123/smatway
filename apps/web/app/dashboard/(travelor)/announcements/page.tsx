"use client";

import { MegaphoneIcon } from "@/app/dashboard/_Components/Icons";
import { Page, PageHeader, EmptyState } from "@/app/dashboard/_Components/ui";

export default function AnnouncementsPage() {
  return (
    <Page>
      <PageHeader
        kicker="From your transporters"
        title="Announcements"
        subtitle="Important updates, route changes, and notices from transporters you've booked with."
      />
      <EmptyState
        title="All quiet for now"
        description="When transporters post announcements that affect your trips, you'll see them here."
        icon={<MegaphoneIcon className="w-6 h-6" />}
      />
    </Page>
  );
}
