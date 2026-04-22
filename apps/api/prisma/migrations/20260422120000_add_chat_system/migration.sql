-- CreateTable Chat
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex Chat_bookingId_key
CREATE UNIQUE INDEX "Chat_bookingId_key" ON "Chat"("bookingId");

-- CreateIndex Chat_bookingId_idx
CREATE INDEX "Chat_bookingId_idx" ON "Chat"("bookingId");

-- CreateIndex Chat_travelerId_idx
CREATE INDEX "Chat_travelerId_idx" ON "Chat"("travelerId");

-- CreateIndex Chat_transporterId_idx
CREATE INDEX "Chat_transporterId_idx" ON "Chat"("transporterId");

-- CreateIndex Message_chatId_idx
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex Message_senderId_idx
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey Chat to Booking
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Chat to User (traveler)
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Chat to User (transporter)
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Message to Chat
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Message to User
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
