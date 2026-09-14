import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    date: { type: Date, required: true, index: true },
    period: { type: Number, default: 1 },
    semester: { type: Number, required: true },
    section: { type: String, default: 'A' },
    topic: { type: String, trim: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
        remark: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ subject: 1, date: 1, period: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
