/*
  Warnings:

  - A unique constraint covering the columns `[orderID]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderID` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "orderID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderID_key" ON "Payment"("orderID");
