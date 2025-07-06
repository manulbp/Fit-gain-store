import { Checkout } from "../models/checkout.model.js";

export const addCheckout = async (req, res) => {
    try {
        const { fname, lname, street, city, state, zipcode, total, mobile, userMail, items } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        if (!fname || !lname || !street || !city || !state || !zipcode || !total || !mobile || !userMail || !items || !items.length) {
            return res.status(400).json({ success: false, message: 'All fields and items are required', data: null });
        }
        const checkout = new Checkout({
            fname,
            lname,
            street,
            city,
            state,
            zipcode,
            total,
            mobile,
            userMail,
            userId,
            items
        });
        const savedCheckout = await checkout.save();
        const populatedCheckout = await Checkout.findById(savedCheckout._id)
            .populate('items.product', 'productname price')
            .lean();
        res.status(201).json({ success: true, message: 'Checkout added successfully', data: populatedCheckout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add checkout', data: null });
    }
};

export const all = async (req, res) => {
    try {
        const checkouts = await Checkout.find()
            .populate('items.product', 'productname price')
            .lean();
        res.status(200).json({ success: true, message: 'Checkouts retrieved', data: checkouts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve checkouts', data: null });
    }
};

export const getCheckout = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        const checkouts = await Checkout.find({ userId })
            .populate('items.product', 'productname price')
            .lean();
        res.status(200).json({ success: true, message: 'Checkouts retrieved', data: checkouts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve checkouts', data: null });
    }
};

export const deleteCheckout = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        const checkout = await Checkout.findOne({ _id: req.params.id, userId });
        if (!checkout) {
            return res.status(404).json({ success: false, message: 'Checkout not found', data: null });
        }
        if (checkout.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Completed checkouts cannot be deleted', data: null });
        }
        await Checkout.deleteOne({ _id: req.params.id, userId });
        res.status(200).json({ success: true, message: 'Checkout deleted', data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete checkout', data: null });
    }
};

export const statusupdate = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status', data: null });
        }
        const updatedCheckout = await Checkout.findOneAndUpdate(
            { _id: req.params.id, userId },
            { status },
            { new: true }
        )
            .populate('items.product', 'productname price')
            .lean();
        if (!updatedCheckout) {
            return res.status(404).json({ success: false, message: 'Checkout not found', data: null });
        }
        res.status(200).json({ success: true, message: 'Status updated', data: updatedCheckout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status', data: null });
    }
};

export const adminStatusUpdate = async (req, res) => {
    try {
        const { status } = req.body;
        const isAdmin = req.headers['is-admin'] === 'true';
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required', data: null });
        }
        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status', data: null });
        }
        const updatedCheckout = await Checkout.findOneAndUpdate(
            { _id: req.params.id },
            { status },
            { new: true }
        )
            .populate('items.product', 'productname price')
            .lean();
        if (!updatedCheckout) {
            return res.status(404).json({ success: false, message: 'Checkout not found', data: null });
        }
        res.status(200).json({ success: true, message: 'Status updated', data: updatedCheckout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status', data: null });
    }
};

export const adminDeleteCheckout = async (req, res) => {
    try {
        const isAdmin = req.headers['is-admin'] === 'true';
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required', data: null });
        }
        const checkout = await Checkout.findOne({ _id: req.params.id });
        if (!checkout) {
            return res.status(404).json({ success: false, message: 'Checkout not found', data: null });
        }
        if (checkout.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Completed checkouts cannot be deleted', data: null });
        }
        await Checkout.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, message: 'Checkout deleted', data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete checkout', data: null });
    }
};