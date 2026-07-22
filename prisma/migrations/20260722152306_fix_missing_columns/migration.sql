/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `badges` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `badges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "badges" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");
