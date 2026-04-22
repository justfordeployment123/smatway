-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "transportType" "TransportType" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Transport" ADD COLUMN "vehicleId" TEXT;

-- AlterTable (remove old vehicle columns)
ALTER TABLE "Transport" DROP COLUMN "vehicleModel", DROP COLUMN "vehiclePlateNumber";

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (make vehicleId NOT NULL after data migration)
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable (make vehicleId required)
ALTER TABLE "Transport" ALTER COLUMN "vehicleId" SET NOT NULL;
