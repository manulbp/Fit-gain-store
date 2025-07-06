import Ticket from "../models/ticket.model.js";
import TicketType from "../models/ticketType.model.js";

export const getTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await TicketType.find();
    if (!ticketTypes || ticketTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ticket types found",
      });
    }
    res.status(200).json({
      success: true,
      data: ticketTypes,
      message: "Ticket types loaded successfully",
    });
  } catch (error) {
    console.error("Error in getTicketTypes:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ticket types",
      error: error.message,
    });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { ticketTypeId, description, userId } = req.body;
    if (!ticketTypeId || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: ticketTypeId, description, or userId",
      });
    }
    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket type ID",
      });
    }
    const newTicket = new Ticket({
      ticketTypeId,
      description,
      userId,
    });
    await newTicket.save();
    const populatedTicket = await Ticket.findById(newTicket._id).populate("ticketTypeId");
    res.status(201).json({
      success: true,
      data: populatedTicket,
      message: "Ticket created successfully",
    });
  } catch (error) {
    console.error("Error in createTicket:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating ticket",
      error: error.message,
    });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const tickets = await Ticket.find({ userId }).populate("ticketTypeId").sort({ createdAt: -1 });
    if (!tickets || tickets.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No tickets found for this user",
      });
    }
    res.status(200).json({
      success: true,
      data: tickets,
      message: "Tickets loaded successfully",
    });
  } catch (error) {
    console.error("Error in getUserTickets:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tickets",
      error: error.message,
    });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { ticketId, userId } = req.body;
    if (!ticketId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: ticketId or userId",
      });
    }
    const ticket = await Ticket.findOne({ _id: ticketId, userId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or not owned by this user",
      });
    }
    if (ticket.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved tickets can be closed",
      });
    }
    ticket.status = "Closed";
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticketId).populate("ticketTypeId");
    res.status(200).json({
      success: true,
      data: updatedTicket,
      message: "Ticket closed successfully",
    });
  } catch (error) {
    console.error("Error in closeTicket:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while closing ticket",
      error: error.message,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const tickets = await Ticket.find(query).populate("ticketTypeId").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tickets,
      message: "Tickets loaded successfully",
    });
  } catch (error) {
    console.error("Error in getAllTickets:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tickets",
      error: error.message,
    });
  }
};

export const startTicketProgress = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID is required",
      });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }
    if (ticket.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Ticket must be in Pending status to start progress",
      });
    }
    ticket.status = "In Progress";
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticketId).populate("ticketTypeId");
    res.status(200).json({
      success: true,
      data: updatedTicket,
      message: "Ticket status updated to In Progress",
    });
  } catch (error) {
    console.error("Error in startTicketProgress:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating ticket status",
      error: error.message,
    });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { ticketId, reply } = req.body;
    if (!ticketId || !reply) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: ticketId or reply",
      });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }
    if (ticket.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "Ticket must be In Progress to resolve",
      });
    }
    ticket.status = "Resolved";
    ticket.reply = reply;
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticketId).populate("ticketTypeId");
    res.status(200).json({
      success: true,
      data: updatedTicket,
      message: "Ticket resolved successfully",
    });
  } catch (error) {
    console.error("Error in resolveTicket:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while resolving ticket",
      error: error.message,
    });
  }
};