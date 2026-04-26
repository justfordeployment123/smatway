"use client";

import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import { AnnouncementsList } from "@/app/dashboard/_Components/AnnouncementsList";

export default function TransporterAnnouncementsPage() {
  return (
    <Page>
      <PageHeader
        kicker="From SmatWay"
        title="Announcements"
        subtitle="Operator updates from the SmatWay team — payout changes, fleet policies, route opportunities."
      />
      <AnnouncementsList
        audience="TRANSPORTER"
        emptyTitle="No announcements yet"
        emptyDescription="When the SmatWay team posts operator-facing news, you'll see it here."
      />
    </Page>
  );
}
