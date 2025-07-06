import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import { connectDB } from './config/database.js';
import authRouter from './routes/auth.routes.js';
import cartRouter from './routes/cart.routes.js';
import chatRouter from './routes/chat.routes.js';
import checkoutRouter from './routes/checkout.routes.js';
import paymentRouter from './routes/payment.routes.js';
import productRouter from './routes/product.routes.js';
import reviewRouter from './routes/review.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();
const port = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

connectDB();

// API End Points
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use("/api/auth", authRouter);
app.use('/api/cart', cartRouter);
app.use("/api/chat",chatRouter)
app.use("/api/checkout", checkoutRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/product', productRouter);
app.use("/api/review",reviewRouter)
app.use("/api/ticket",ticketRouter)
app.use("/api/user",userRouter)


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});