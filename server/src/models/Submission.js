import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    submittedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    files: [{ name: String, url: String, size: Number }],
    status: { type: String, enum: ['submitted', 'late', 'evaluated', 'resubmit'], default: 'submitted' },
    marks: { type: Number, min: 0 },
    feedback: { type: String, trim: true },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
