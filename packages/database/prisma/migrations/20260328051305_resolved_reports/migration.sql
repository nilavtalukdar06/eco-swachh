-- CreateTable
CREATE TABLE "ResolvedRerport" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResolvedRerport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResolvedRerport_reportId_key" ON "ResolvedRerport"("reportId");

-- AddForeignKey
ALTER TABLE "ResolvedRerport" ADD CONSTRAINT "ResolvedRerport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResolvedRerport" ADD CONSTRAINT "ResolvedRerport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
