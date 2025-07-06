import Review from "../models/review.model.js";

export const addReview = async (req, res) => {
    try {
        const { userId, content } = req.body;
        if (!userId || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId or content",
            });
        }
        const review = new Review({ userId, content });
        await review.save();
        const populatedReview = await Review.findById(review._id)
            .populate("userId", "name role")
            .lean();
        res.status(201).json({
            success: true,
            data: populatedReview,
            message: "Review added successfully",
        });
    } catch (error) {
        console.error("Error in addReview:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while adding review",
            error: error.message,
        });
    }
};

export const loadMyReviews = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const reviews = await Review.find({ userId })
            .populate("userId", "name role")
            .sort({ dateTime: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: reviews,
            message: "Reviews retrieved successfully",
        });
    } catch (error) {
        console.error("Error in loadMyReviews:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching reviews",
            error: error.message,
        });
    }
};

export const loadAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("userId", "name role")
            .sort({ dateTime: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: reviews,
            message: "All reviews retrieved successfully",
        });
    } catch (error) {
        console.error("Error in loadAllReviews:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching all reviews",
            error: error.message,
        });
    }
};