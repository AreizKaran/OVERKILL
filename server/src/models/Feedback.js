import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['student-to-faculty', 'faculty-to-admin'], required: true, index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Number },
    academicYear: { type: String },
    ratings: {
      teachingQuality: { type: Number, min: 1, max: 5 },
      clarity: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      supportiveness: { type: Number, min: 1, max: 5 },
      courseContent: { type: Number, min: 1, max: 5 },
    },
    averageRating: { type: Number, default: 0 },
    comment: { type: String, trim: true, maxlength: 2000 },
    anonymous: { type: Boolean, default: true },
    status: { type: String, enum: ['open', 'reviewed', 'actioned', 'closed'], default: 'open' },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

feedbackSchema.pre('save', function computeAverage(next) {
  const values = Object.values(this.ratings?.toObject?.() ?? this.ratings ?? {}).filter(
    (v) => typeof v === 'number'
  );
  this.averageRating = values.length
    ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
    : 0;
  return next();
});

export default mongoose.model('Feedback', feedbackSchema);
