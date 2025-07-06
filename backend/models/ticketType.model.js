import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const TicketType = mongoose.models.TicketType || mongoose.model("TicketType", ticketTypeSchema);

export default TicketType;
