-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('MANUAL', 'AUTOMATION', 'CLIENT_PORTAL', 'MONITORING');

-- CreateEnum
CREATE TYPE "TicketUpdateType" AS ENUM ('NOTE', 'STATUS_CHANGE', 'INCIDENT');

-- CreateEnum
CREATE TYPE "TicketWatcherType" AS ENUM ('CLIENT', 'INTERNAL');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "lastClientNotifAt" TIMESTAMP(3),
ADD COLUMN     "notifyClient" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "serviceArea" TEXT,
ADD COLUMN     "source" "TicketSource" NOT NULL DEFAULT 'MANUAL';

ALTER TABLE "Ticket" ADD COLUMN "ticketNumber" INTEGER;
CREATE SEQUENCE IF NOT EXISTS "Ticket_ticketNumber_seq";
ALTER TABLE "Ticket" ALTER COLUMN "ticketNumber" SET DEFAULT nextval('"Ticket_ticketNumber_seq"');
UPDATE "Ticket" SET "ticketNumber" = nextval('"Ticket_ticketNumber_seq"') WHERE "ticketNumber" IS NULL;
ALTER TABLE "Ticket" ALTER COLUMN "ticketNumber" SET NOT NULL;

-- CreateTable
CREATE TABLE "TicketUpdate" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" "TicketUpdateType" NOT NULL DEFAULT 'NOTE',
    "message" TEXT NOT NULL,
    "previousStatus" "TicketStatus",
    "nextStatus" "TicketStatus",
    "public" BOOLEAN NOT NULL DEFAULT false,
    "notifyClient" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketWatcher" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" "TicketWatcherType" NOT NULL DEFAULT 'CLIENT',
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- AddForeignKey
ALTER TABLE "TicketUpdate" ADD CONSTRAINT "TicketUpdate_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketUpdate" ADD CONSTRAINT "TicketUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketWatcher" ADD CONSTRAINT "TicketWatcher_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

