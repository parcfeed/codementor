-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "snippets" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'INTERMEDIATE';
