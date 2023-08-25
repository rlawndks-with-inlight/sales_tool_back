import express from 'express';
import validate from 'express-validation';
import { salesManCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(salesManCtrl.list)
    .post(salesManCtrl.create)
router
    .route('/organizational-chart')
    .get(salesManCtrl.organizational_chart)

export default router;
