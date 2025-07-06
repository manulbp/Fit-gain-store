import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export const getUserChat = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const chat = await Chat.findOne({ userId })
            .populate("userId", "name email role")
            .lean();
        res.status(200).json({
            success: true,
            data: chat || null,
            message: chat ? "Chat retrieved successfully" : "No chat found for this user",
        });
    } catch (error) {
        console.error("Error in getUserChat:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching user chat",
            error: error.message,
        });
    }
};

export const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({})
            .populate("userId", "name email role")
            .sort({ updatedAt: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: chats,
            message: "Chats retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getAllChats:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching chats",
            error: error.message,
        });
    }
};

export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.query;
        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required",
            });
        }
        const messages = await Message.find({ chatId })
            .populate("senderId", "name role")
            .sort({ time: 1 })
            .lean();
        res.status(200).json({
            success: true,
            data: messages,
            message: "Messages retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getChatMessages:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching messages",
            error: error.message,
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatId, senderId, content, from } = req.body;
        if (!senderId || !content || !["user", "admin"].includes(from)) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid fields: senderId, content, or from",
            });
        }
        let chat;
        if (chatId) {
            chat = await Chat.findById(chatId).lean();
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found",
                });
            }
        } else if (from === "user") {
            chat = await Chat.findOne({ userId: senderId }).lean();
            if (!chat) {
                chat = new Chat({ userId: senderId });
                await chat.save();
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required for admin messages",
            });
        }
        const message = new Message({
            chatId: chat._id,
            senderId,
            content,
            from,
        });
        await message.save();
        await Chat.updateOne({ _id: chat._id }, { $set: { updatedAt: Date.now() } });
        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "name role")
            .lean();
        res.status(201).json({
            success: true,
            data: { chatId: chat._id, message: populatedMessage },
            message: "Message sent successfully",
        });
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while sending message",
            error: error.message,
        });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { messageIds } = req.body;
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid field: messageIds must be a non-empty array",
            });
        }
        await Message.updateMany(
            { _id: { $in: messageIds }, status: "send" },
            { $set: { status: "seen" } }
        );
        const updatedMessages = await Message.find({ _id: { $in: messageIds } })
            .populate("senderId", "name role")
            .lean();
        res.status(200).json({
            success: true,
            data: updatedMessages,
            message: "Message statuses updated successfully",
        });
    } catch (error) {
        console.error("Error in updateMessageStatus:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while updating message status",
            error: error.message,
        });
    }
};

export const getUnreadMessages = async (req, res) => {
    try {
        const { chatId } = req.body;
        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required",
            });
        }
        const unreadMessages = await Message.find({
            chatId,
            from: "user",
            status: "send",
        })
            .populate("senderId", "name role")
            .sort({ time: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: unreadMessages,
            message: "Unread messages retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getUnreadMessages:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching unread messages",
            error: error.message,
        });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required",
            });
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }
        await Message.deleteMany({ chatId });
        await Chat.deleteOne({ _id: chatId });
        res.status(200).json({
            success: true,
            message: "Chat and messages deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteChat:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while deleting chat",
            error: error.message,
        });
    }
};