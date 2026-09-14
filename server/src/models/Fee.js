import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    items: [
      {
        head: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'partial', 'pending', 'overdue'], default: 'pending' },
    transactions: [
      {
        transactionId: String,
        amount: Number,
        mode: { type: String, enum: ['Net Banking', 'UPI', 'Card', 'NEFT', 'Cash', 'Scholarship'] },
        paidAt: { type: Date, default: Date.now },
        receiptNo: String,
        remark: String,
      },
    ],
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, academicYear: 1, semester: 1 }, { unique: true });

feeSchema.pre('save', function computeTotals(next) {
  this.totalAmount = (this.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  this.paidAmount = (this.transactions || []).reduce((sum, t) => sum + (t.amount || 0), 0);
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) this.status = 'paid';
  else if (this.paidAmount > 0) this.status = 'partial';
  else if (this.dueDate && this.dueDate < new Date()) this.status = 'overdue';
  else this.status = 'pending';
  return next();
});

export default mongoose.model('Fee', feeSchema);
