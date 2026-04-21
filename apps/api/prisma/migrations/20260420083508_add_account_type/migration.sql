-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('TRAVELER', 'TRANSPORTER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType";
