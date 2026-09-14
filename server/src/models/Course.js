import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ['UG', 'PG', 'PhD'], default: 'UG' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    durationYears: { type: Number, default: 4 },
    totalSemesters: { type: Number, default: 8 },
    totalCredits: { type: Number, default: 160 },
    intake: { type: Number, default: 60 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
