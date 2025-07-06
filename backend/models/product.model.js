import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  guidance: { type: String, default: 'No guidance available' },
  image: { type: String, required: true },
});

export default mongoose.model('Product', ProductSchema);