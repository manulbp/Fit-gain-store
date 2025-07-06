import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Product from '../models/product.model.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
        }
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `product-${uniqueSuffix}${ext}`);
    },
});

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const fileFilter = (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMiddleware = upload.single('image');

export const test = (req, res) => res.json({ message: 'API is working!' });

export const addProducts = async (req, res) => {
    const { productname, description, category, condition, quantity, price, guidance } = req.body;

    if (!productname || !description || !category || !quantity || !price || !req.file) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ success: false, message: 'All required fields, including image, must be provided' });
    }

    try {
        const product = new Product({
            productname,
            description,
            category,
            condition: condition || 'New',
            quantity: parseInt(quantity),
            price: parseFloat(price),
            guidance: guidance || 'No guidance available',
            image: '',
        });

        const productDir = path.join(__dirname, '../Uploads/product', product._id.toString());
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }

        const ext = path.extname(req.file.filename).toLowerCase();
        const newImageName = `product-${Date.now()}${ext}`;
        const newImagePath = path.join(productDir, newImageName);
        fs.renameSync(req.file.path, newImagePath);

        product.image = `uploads/product/${product._id.toString()}/${newImageName}`;

        await product.save();
        res.status(201).json({ success: true, message: 'Product added successfully', product });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Unable to add product', error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const { productname, description, category, condition, quantity, price, guidance } = req.body;

    try {
        const product = await Product.findById(pid);
        if (!product) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (req.file) {
            const oldImagePath = path.join(__dirname, '../', product.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            const productDir = path.join(__dirname, '../Uploads/product', product._id.toString());
            if (!fs.existsSync(productDir)) {
                fs.mkdirSync(productDir, { recursive: true });
            }

            const ext = path.extname(req.file.filename).toLowerCase();
            const newImageName = `product-${Date.now()}${ext}`;
            const newImagePath = path.join(productDir, newImageName);
            fs.renameSync(req.file.path, newImagePath);

            product.image = `uploads/product/${product._id.toString()}/${newImageName}`;
        }

        product.productname = productname || product.productname;
        product.description = description || product.description;
        product.category = category || product.category;
        product.condition = condition || product.condition;
        product.quantity = quantity ? parseInt(quantity) : product.quantity;
        product.price = price ? parseFloat(price) : product.price;
        product.guidance = guidance || product.guidance;

        await product.save();
        res.status(200).json({ success: true, product });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const getById = async (req, res) => {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    try {
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (product.image) {
            product.image = product.image.replace(/\\/g, '/');
        }
        res.status(200).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    try {
        const product = await Product.findByIdAndDelete(pid);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const productDir = path.join(__dirname, '../Uploads/product', pid);
        if (fs.existsSync(productDir)) {
            fs.rmSync(productDir, { recursive: true, force: true });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        const normalizedProducts = products.map((product) => ({
            ...product.toObject(),
            image: product.image ? product.image.replace(/\\/g, '/') : null,
        }));
        res.status(200).json({ success: true, products: normalizedProducts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const getLatestProducts = async (req, res) => {
    try {
        const equipmentProducts = await Product.find({ category: 'Equipment' })
            .sort({ createdAt: -1 })
            .limit(4);

        const supplementProducts = await Product.find({ category: 'Supplement' })
            .sort({ createdAt: -1 })
            .limit(4);

        const normalizedEquipment = equipmentProducts.map((product) => ({
            ...product.toObject(),
            image: product.image ? product.image.replace(/\\/g, '/') : null,
        }));

        const normalizedSupplements = supplementProducts.map((product) => ({
            ...product.toObject(),
            image: product.image ? product.image.replace(/\\/g, '/') : null,
        }));

        res.status(200).json({
            success: true,
            equipment: normalizedEquipment,
            supplements: normalizedSupplements,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const filterProducts = async (req, res) => {
    try {
        const { name, category, condition } = req.query;
        const query = {};

        if (name) {
            query.productname = { $regex: name, $options: 'i' }; // Case-insensitive search
        }

        if (category && ['Equipment', 'Supplement'].includes(category)) {
            query.category = category;
        }

        if (condition && ['Brand New', 'Secondary'].includes(condition)) {
            query.condition = condition === 'Brand New' ? 'New' : 'Used';
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        const normalizedProducts = products.map((product) => ({
            ...product.toObject(),
            image: product.image ? product.image.replace(/\\/g, '/') : null,
        }));

        res.status(200).json({ success: true, products: normalizedProducts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};


export const updateProductQuantity = async (req, res) => {
    const { pid } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    if (quantity === undefined) {
        return res.status(400).json({ success: false, message: 'Quantity must be provided' });
    }

    try {
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newQuantity = product.quantity - parseInt(quantity);
        
        if (newQuantity < 0) {
            return res.status(400).json({ success: false, message: 'Not enough stock available' });
        }

        product.quantity = newQuantity;
        await product.save();

        if (product.image) {
            product.image = product.image.replace(/\\/g, '/');
        }
        
        res.status(200).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};