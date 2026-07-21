-- CreateIndex
CREATE INDEX "users_reputation_score_idx" ON "users"("reputation_score");

-- CreateIndex
CREATE INDEX "snippets_created_at_idx" ON "snippets"("created_at");

-- CreateIndex
CREATE INDEX "snippets_language_created_at_idx" ON "snippets"("language", "created_at");

-- CreateIndex
CREATE INDEX "reviews_snippet_id_created_at_idx" ON "reviews"("snippet_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_snippet_id_reviewer_id_idx" ON "reviews"("snippet_id", "reviewer_id");
