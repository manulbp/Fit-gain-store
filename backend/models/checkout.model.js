import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CheckoutSchema = new Schema({
    fname: String,
    lname: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    total: Number,
    mobile: Number,
    userMail: String,
    userId: String,
    status: { type: String, default: 'Pending' },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        productname: String,
        quantity: Number,
        price: Number
    }],
    createdAt: { type: Date, default: Date.now }
}, {
    collection: "Checkout",
    timestamps: true,
});

export const Checkout = mongoose.model('Checkout', CheckoutSchema);