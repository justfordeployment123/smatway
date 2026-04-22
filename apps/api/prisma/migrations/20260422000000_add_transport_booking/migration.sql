-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('CAR', 'BUS', 'VAN', 'MINIBUS', 'TRUCK');

-- CreateEnum
CREATE TYPE "TransportStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FULL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'MPAISA');

-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "departureCountry" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "transportType" "TransportType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "departureDateTime" TIMESTAMP(3) NOT NULL,
    "vehiclePlateNumber" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "status" "TransportStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "transportId" TEXT NOT NULL,
    "seatsBooked" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Transport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
