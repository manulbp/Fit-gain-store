import express from "express";
import { addReview, loadMyReviews, loadAllReviews } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", addReview);
reviewRouter.post("/my-reviews", loadMyReviews);
reviewRouter.get("/all-reviews", loadAllReviews);

export default reviewRouter;