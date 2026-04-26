-- Add BLOCKED to TransportStatus. Routes with this status are excluded
-- from traveler search and reject new bookings — but their existing
-- bookings still flow through to completion. Distinct from INACTIVE
-- (which is for transporter-side soft-delete) so the audit trail and
-- UI can show why a route is offline.

ALTER TYPE "TransportStatus" ADD VALUE IF NOT EXISTS 'BLOCKED';
