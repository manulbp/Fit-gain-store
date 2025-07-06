import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

async function createCartItem(req, res) {
    try {
        const { product, quantity } = req.body;
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        if (!product || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Product and valid quantity are required', data: null });
        }
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ success: false, message: 'Product not found', data: null });
        }
        const cartItem = new Cart({
            user,
            product,
            quantity,
            price: productExists.price,
        });
        const savedItem = await cartItem.save();
        const populatedItem = await Cart.findById(savedItem._id)
            .populate('product', 'productname description category condition quantity price image')
            .lean();
        res.status(201).json({ success: true, message: 'Cart item created', data: populatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create cart item', data: null });
    }
}

async function getAllCartItems(req, res) {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        const items = await Cart.find({ user })
            .populate('product', 'productname description category condition quantity price image')
            .lean();
        res.status(200).json({ success: true, message: 'Cart items retrieved', data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve cart items', data: null });
    }
}

async function getCartItemById(req, res) {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        const item = await Cart.findOne({ _id: req.params.id, user })
            .populate('product', 'productname description category condition quantity price image')
            .lean();
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found', data: null });
        }
        res.status(200).json({ success: true, message: 'Cart item retrieved', data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve cart item', data: null });
    }
}

async function updateCartItem(req, res) {
    try {
        const { quantity } = req.body;
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Valid quantity is required', data: null });
        }
        const updatedItem = await Cart.findOneAndUpdate(
            { _id: req.params.id, user },
            { quantity },
            { new: true, runValidators: true }
        )
            .populate('product', 'productname description category condition quantity price image')
            .lean();
        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found', data: null });
        }
        res.status(200).json({ success: true, message: 'Cart item updated', data: updatedItem });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update cart item', data: null });
    }
}

async function deleteCartItem(req, res) {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        const deletedItem = await Cart.findOneAndDelete({ _id: req.params.id, user });
        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found', data: null });
        }
        res.status(200).json({ success: true, message: 'Cart item deleted', data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete cart item', data: null });
    }
}

async function bulkDeleteAndUpdate(req, res) {
    try {
        const { itemIds } = req.body;
        const user = req.user?._id;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }
        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Valid item IDs are required', data: null });
        }

        const cartItems = await Cart.find({ _id: { $in: itemIds }, user })
            .populate('product', 'quantity')
            .lean();
        if (cartItems.length !== itemIds.length) {
            return res.status(404).json({ success: false, message: 'One or more cart items not found', data: null });
        }

        for (const item of cartItems) {
            if (item.product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${item.product._id}`,
                    data: null,
                });
            }
        }

        const updatePromises = cartItems.map((item) =>
            Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { quantity: -item.quantity } },
                { new: true, runValidators: true }
            )
        );
        await Promise.all(updatePromises);

        await Cart.deleteMany({ _id: { $in: itemIds }, user });

        res.status(200).json({
            success: true,
            message: 'Cart items deleted and product quantities updated',
            data: cartItems,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to process request', data: null });
    }
}

export { createCartItem, getAllCartItems, getCartItemById, updateCartItem, deleteCartItem, bulkDeleteAndUpdate };