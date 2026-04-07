-- AlterTable: Add family relationship fields to Contact
ALTER TABLE "Contact" ADD COLUMN "isMother" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Contact" ADD COLUMN "isFather" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Contact" ADD COLUMN "spouseId" TEXT;
ALTER TABLE "Contact" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_spouseId_key" ON "Contact"("spouseId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
