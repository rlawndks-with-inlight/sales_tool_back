import express from 'express';
import validate from 'express-validation';
import { userCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(userCtrl.list)
    .post(userCtrl.create);
router
    .route('/:id')
    .get(userCtrl.get)
    .put(userCtrl.update)
    .delete(userCtrl.remove)

export default router;
