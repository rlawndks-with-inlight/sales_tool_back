import express from 'express';
import userRoutes from './user.route.js';
import brandRoutes from './brand.route.js';
import authRoutes from './auth.route.js';
import domainRoutes from './domain.route.js';
import productRoutes from './product.route.js';
import upload from '../config/multerConfig.js';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */


// mount user routes at /users
router.use('/users', userRoutes);
router.use('/brands', brandRoutes);
router.use('/auth', authRoutes);
router.use('/domain', domainRoutes);
router.use('/products', productRoutes);


export default router;
