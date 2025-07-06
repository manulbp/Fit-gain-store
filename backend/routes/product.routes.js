// product.route.js with new route added

import express from 'express';
import { 
    addProducts, 
    deleteProduct, 
    filterProducts, 
    getAllProducts, 
    getById, 
    getLatestProducts, 
    test, 
    updateProduct, 
    uploadMiddleware,
    updateProductQuantity 
} from '../controllers/product.controller.js';

const productRouter = express.Router();

productRouter.get('/', test);
productRouter.post('/add', uploadMiddleware, addProducts);
productRouter.get('/all', getAllProducts);
productRouter.put('/update/:pid', uploadMiddleware, updateProduct);
productRouter.delete('/delete/:pid', deleteProduct);
productRouter.get('/get/:pid', getById);
productRouter.get('/latest', getLatestProducts);
productRouter.get('/filter', filterProducts);
productRouter.put('/update-quantity/:pid', updateProductQuantity); 

export default productRouter;