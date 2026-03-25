/*
  Warnings:

  - You are about to drop the column `isArchived` on the `complaint` table. All the data in the column will be lost.
  - You are about to drop the `ComplaintArchive` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComplaintArchive" DROP CONSTRAINT "ComplaintArchive_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ComplaintArchive" DROP CONSTRAINT "ComplaintArchive_complaintId_fkey";

-- DropIndex
DROP INDEX "complaint_deletedForAdmin_isArchived_idx";

-- AlterTable
ALTER TABLE "complaint" DROP COLUMN "isArchived";

-- DropTable
DROP TABLE "ComplaintArchive";

-- CreateIndex
CREATE INDEX "complaint_deletedForAdmin_idx" ON "complaint"("deletedForAdmin");
