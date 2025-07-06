import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
    ticketTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketType",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved", "Closed"],
        default: "Pending",
    },
    reply: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;