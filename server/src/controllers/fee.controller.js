import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

export const listFees = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.profile?._id;
  else if (req.query.student) filter.student = req.query.student;
  if (req.query.status) filter.status = req.query.status;

  const fees = await Fee.find(filter)
    .populate({ path: 'student', select: 'rollNo registrationNo semester', populate: { path: 'user', select: 'name email' } })
    .sort({ semester: -1 });

  const summary = fees.reduce(
    (acc, fee) => {
      acc.billed += fee.totalAmount;
      acc.collected += fee.paidAmount;
      acc.outstanding += Math.max(fee.totalAmount - fee.paidAmount, 0);
      return acc;
    },
    { billed: 0, collected: 0, outstanding: 0 }
  );

  res.json({ success: true, data: fees, meta: { ...summary, count: fees.length } });
});

export const createFee = asyncHandler(async (req, res) => {
  const fee = await Fee.create(req.body);
  const student = await Student.findById(fee.student).select('user');
  await notify(student?.user, {
    title: `Fee demand generated — Semester ${fee.semester}`,
    message: `₹${fee.totalAmount.toLocaleString('en-IN')} due by ${new Date(fee.dueDate).toDateString()}.`,
    type: 'fee',
    link: '/app/fees',
  });
  res.status(201).json({ success: true, data: fee });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) throw ApiError.notFound('Fee record not found');

  const { amount, mode = 'Net Banking', remark } = req.body;
  if (!amount || amount <= 0) throw ApiError.badRequest('A positive payment amount is required');
  if (fee.paidAmount + amount > fee.totalAmount) throw ApiError.badRequest('Payment exceeds the outstanding amount');

  fee.transactions.push({
    transactionId: `TXN${Date.now()}`,
    receiptNo: `SMIT/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}`,
    amount,
    mode,
    remark,
    paidAt: new Date(),
  });
  await fee.save();
  res.json({ success: true, data: fee });
});

export const updateFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) throw ApiError.notFound('Fee record not found');
  Object.assign(fee, req.body);
  await fee.save();
  res.json({ success: true, data: fee });
});
