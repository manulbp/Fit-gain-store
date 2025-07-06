import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["send", "seen"],
        default: "send",
    },
    from: {
        type: String,
        enum: ["user", "admin"],
        required: true,
    },
}, { timestamps: true });

messageSchema.index({ chatId: 1, time: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;