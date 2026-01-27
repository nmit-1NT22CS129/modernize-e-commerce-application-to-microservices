import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import Product from "../models/productModel.js"; 

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  try {
    const { category, subCategory, price_lte, price_gte } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (price_lte || price_gte) {
      filter.price = {};
      if (price_lte) filter.price.$lte = Number(price_lte);
      if (price_gte) filter.price.$gte = Number(price_gte);
    }

    const products = await Product.find(filter);
    res.json({ success: true, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Existing admin/product routes (unchanged)
productRouter.post(
  '/add',
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]),
  addProduct
);

productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);

export default productRouter;
