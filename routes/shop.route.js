import express from 'express';
import validate from 'express-validation';
import { shopCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(shopCtrl.main)


export default router;
