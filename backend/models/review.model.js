import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    dateTime: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

reviewSchema.index({ userId: 1, dateTime: -1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;