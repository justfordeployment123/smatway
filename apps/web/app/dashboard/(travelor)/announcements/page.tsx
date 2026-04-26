"use client";

import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import { AnnouncementsList } from "@/app/dashboard/_Components/AnnouncementsList";

export default function AnnouncementsPage() {
  return (
    <Page>
      <PageHeader
        kicker="From SmatWay"
        title="Announcements"
        subtitle="Important updates from the SmatWay team — service notices, route changes, and platform news."
      />
      <AnnouncementsList
        audience="TRAVELER"
        emptyTitle="All quiet for now"
        emptyDescription="When the SmatWay team posts platform-wide news, you'll see it here."
      />
    </Page>
  );
}
