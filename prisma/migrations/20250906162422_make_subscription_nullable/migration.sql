-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscriptionID_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "subscriptionID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
