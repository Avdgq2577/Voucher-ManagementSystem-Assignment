import { Router } from 'express';
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  uploadSignatureImage
} from '../controllers/voucherController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSignature } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getVouchers);
router.post('/', createVoucher);
router.post('/upload-signature', uploadSignature.single('signature'), uploadSignatureImage);
router.get('/:id', getVoucherById);
router.put('/:id', updateVoucher);
router.delete('/:id', deleteVoucher);
router.post('/:id/submit', submitVoucher);
router.post('/:id/approve', approveVoucher);
router.post('/:id/reject', rejectVoucher);

export default router;
