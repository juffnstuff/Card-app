-- Add mailing address to Contact for mail-by date distance estimation
ALTER TABLE "Contact" ADD COLUMN "mailingAddress" TEXT;

-- Add lifecycle fields to CardOrder
ALTER TABLE "CardOrder" ADD COLUMN "confirmedAt" TIMESTAMP(3);
ALTER TABLE "CardOrder" ADD COLUMN "mailByDate" TIMESTAMP(3);

-- Add type and orderId to Notification for new notification types
ALTER TABLE "Notification" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'reminder';
ALTER TABLE "Notification" ADD COLUMN "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "CardOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
