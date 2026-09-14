import { Router } from 'express';
import { listFees, createFee, recordPayment, updateFee } from '../controllers/fee.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(listFees).post(authorize('admin'), createFee);
router.patch('/:id', authorize('admin'), updateFee);
router.post('/:id/payments', authorize('admin', 'student'), recordPayment);

export default router;
