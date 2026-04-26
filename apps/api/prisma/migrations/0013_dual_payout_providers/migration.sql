-- Dual payout providers: a transporter can have BOTH Paystack and
-- Flutterwave accounts configured (or just one, or neither). Previously
-- the bank* columns were shared between providers, so configuring a
-- second provider clobbered the first.
--
-- After this migration:
--   bankCode/bankAccountNumber/bankAccountName + paystackRecipientCode = Paystack-side
--   flwBankCode/flwBankAccountNumber/flwBankAccountName                = Flutterwave-side
--
-- Backfill: rows whose payoutProvider was FLUTTERWAVE had their FLW bank
-- info living in bankCode/bankAccountNumber/bankAccountName. Move it to
-- the new columns and clear the originals so they don't masquerade as
-- Paystack data (the absence of paystackRecipientCode would otherwise
-- already prevent a Paystack release, but cleaner to be explicit).

ALTER TABLE "User" ADD COLUMN "flwBankCode" TEXT;
ALTER TABLE "User" ADD COLUMN "flwBankAccountNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "flwBankAccountName" TEXT;

UPDATE "User"
SET
  "flwBankCode"          = "bankCode",
  "flwBankAccountNumber" = "bankAccountNumber",
  "flwBankAccountName"   = "bankAccountName",
  "bankCode"             = NULL,
  "bankAccountNumber"    = NULL,
  "bankAccountName"      = NULL
WHERE "payoutProvider" = 'FLUTTERWAVE';
