-- Add provider routing for outbound payouts (Paystack vs Flutterwave).
-- User.payoutProvider records each transporter's preferred provider.
-- Payout.provider snapshots which provider was used at release time so we
-- can reconcile against the right API even if the transporter switches later.
-- Payout.flwTransferId is Flutterwave's numeric transfer ID for reconciliation.

ALTER TABLE "User" ADD COLUMN "payoutProvider" "PaymentMethod";

ALTER TABLE "Payout" ADD COLUMN "provider" "PaymentMethod";
ALTER TABLE "Payout" ADD COLUMN "flwTransferId" INTEGER;
