-- Create schema and tables for Agency OS
-- This script initializes all database tables for the application

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS "Client" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "contactName" TEXT,
  "contactEmail" TEXT,
  phone TEXT,
  country TEXT,
  timezone TEXT,
  industry TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'LEAD',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS "Project" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISCOVERY',
  "clientId" TEXT NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  "managerId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  description TEXT,
  "startDate" TIMESTAMP,
  "dueDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ProjectUpdates table
CREATE TABLE IF NOT EXISTS "ProjectUpdate" (
  id TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'NOTE',
  title TEXT,
  message TEXT NOT NULL,
  "authorName" TEXT,
  "authorEmail" TEXT,
  "notifyTeam" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS "Ticket" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  "clientId" TEXT REFERENCES "Client"(id) ON DELETE SET NULL,
  "projectId" TEXT REFERENCES "Project"(id) ON DELETE SET NULL,
  "assigneeId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  "projectId" TEXT REFERENCES "Project"(id) ON DELETE SET NULL,
  amount FLOAT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  "issueDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "referralId" TEXT REFERENCES "PartnerReferral"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE IF NOT EXISTS "Partner" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'AFFILIATE',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "contactName" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "trackingCode" TEXT UNIQUE,
  "baseCommissionRate" FLOAT,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PartnerReferrals table
CREATE TABLE IF NOT EXISTS "PartnerReferral" (
  id TEXT PRIMARY KEY,
  "partnerId" TEXT NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
  "clientId" TEXT REFERENCES "Client"(id) ON DELETE SET NULL,
  "projectId" TEXT REFERENCES "Project"(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "commissionRate" FLOAT,
  "commissionBase" FLOAT,
  "commissionAmount" FLOAT,
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PartnerPayouts table
CREATE TABLE IF NOT EXISTS "PartnerPayout" (
  id TEXT PRIMARY KEY,
  "partnerId" TEXT NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
  "referralId" TEXT REFERENCES "PartnerReferral"(id) ON DELETE SET NULL,
  amount FLOAT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'PENDING',
  "payoutDate" TIMESTAMP,
  method TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "Project_clientId" ON "Project"("clientId");
CREATE INDEX IF NOT EXISTS "Project_managerId" ON "Project"("managerId");
CREATE INDEX IF NOT EXISTS "Ticket_clientId" ON "Ticket"("clientId");
CREATE INDEX IF NOT EXISTS "Ticket_projectId" ON "Ticket"("projectId");
CREATE INDEX IF NOT EXISTS "Ticket_assigneeId" ON "Ticket"("assigneeId");
CREATE INDEX IF NOT EXISTS "Invoice_clientId" ON "Invoice"("clientId");
CREATE INDEX IF NOT EXISTS "Invoice_projectId" ON "Invoice"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectUpdate_projectId" ON "ProjectUpdate"("projectId");
CREATE INDEX IF NOT EXISTS "PartnerReferral_partnerId" ON "PartnerReferral"("partnerId");
CREATE INDEX IF NOT EXISTS "PartnerReferral_clientId" ON "PartnerReferral"("clientId");
CREATE INDEX IF NOT EXISTS "PartnerReferral_projectId" ON "PartnerReferral"("projectId");
CREATE INDEX IF NOT EXISTS "PartnerPayout_partnerId" ON "PartnerPayout"("partnerId");
CREATE INDEX IF NOT EXISTS "PartnerPayout_referralId" ON "PartnerPayout"("referralId");
