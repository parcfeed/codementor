-- Check constraints for Vote.value (must be 1 or -1) and Review.rating (must be between 1 and 5)
ALTER TABLE "votes" ADD CONSTRAINT "votes_value_check" CHECK ("value" = 1 OR "value" = -1);
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);
