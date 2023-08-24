import express from 'express';
import userRoutes from './user.route.js';
import brandRoutes from './brand.route.js';
import authRoutes from './auth.route.js';
import domainRoutes from './domain.route.js';
import productRoutes from './product.route.js';
import productCategoryRoutes from './product_category.route.js';
import uploadRoutes from './upload.route.js';
import logRoutes from './log.route.js';
import shopRoutes from './shop.route.js';
import contractRoutes from './contract.route.js';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */

// tables
router.use('/users', userRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/product-categories', productCategoryRoutes);
router.use('/logs', logRoutes);
router.use('/contracts', contractRoutes);

//auth
router.use('/auth', authRoutes);

//util
router.use('/domain', domainRoutes);
router.use('/upload', uploadRoutes);

//user
router.use('/shop', shopRoutes);


export default router;
