-- Add author_id as nullable first
ALTER TABLE "comments" ADD COLUMN "author_id" TEXT;

-- Backfill: comment author = parent review reviewer
UPDATE "comments" c
SET "author_id" = r."reviewer_id"
FROM "reviews" r
WHERE c."review_id" = r."id" AND c."author_id" IS NULL;

-- Make the column required once backfill is complete
ALTER TABLE "comments" ALTER COLUMN "author_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
