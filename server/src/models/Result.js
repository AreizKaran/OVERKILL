import mongoose from 'mongoose';

export const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0 };

export function deriveGrade(percentage) {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 45) return 'C';
  if (percentage >= 40) return 'P';
  return 'F';
}

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    semester: { type: Number, required: true, index: true },
    academicYear: { type: String, trim: true },
    internal: {
      sessional1: { type: Number, default: 0 },
      sessional2: { type: Number, default: 0 },
      assignment: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
    },
    externalMarks: { type: Number, default: 0 },
    maxInternal: { type: Number, default: 40 },
    maxExternal: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, enum: Object.keys(GRADE_POINTS), default: 'P' },
    gradePoint: { type: Number, default: 0 },
    credits: { type: Number, default: 3 },
    status: { type: String, enum: ['pass', 'fail', 'pending', 'withheld'], default: 'pending' },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });

resultSchema.pre('save', function computeDerived(next) {
  const internalTotal =
    (this.internal?.sessional1 || 0) +
    (this.internal?.sessional2 || 0) +
    (this.internal?.assignment || 0) +
    (this.internal?.attendance || 0);
  this.totalMarks = internalTotal + (this.externalMarks || 0);
  const max = (this.maxInternal || 0) + (this.maxExternal || 0);
  this.percentage = max ? Number(((this.totalMarks / max) * 100).toFixed(2)) : 0;
  this.grade = deriveGrade(this.percentage);
  this.gradePoint = GRADE_POINTS[this.grade];
  this.status = this.grade === 'F' ? 'fail' : 'pass';
  return next();
});

export default mongoose.model('Result', resultSchema);
