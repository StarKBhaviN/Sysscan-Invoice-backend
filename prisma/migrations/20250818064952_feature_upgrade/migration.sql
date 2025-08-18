-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Pairing" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "desktopClientId" TEXT,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pairing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SqliteFile" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "remoteUrl" TEXT NOT NULL,
    "localPath" TEXT,
    "checksum" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SqliteFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pairing_code_key" ON "Pairing"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SqliteFile_userID_key" ON "SqliteFile"("userID");

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SqliteFile" ADD CONSTRAINT "SqliteFile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
