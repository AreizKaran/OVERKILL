import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    semester: { type: Number, required: true },
    section: { type: String, default: 'A' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    assignedOn: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true, index: true },
    maxMarks: { type: Number, default: 20 },
    weightage: { type: Number, default: 0 },
    allowLateSubmission: { type: Boolean, default: false },
    attachments: [{ name: String, url: String, size: Number }],
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
