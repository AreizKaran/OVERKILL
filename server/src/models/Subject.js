import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    semester: { type: Number, required: true, min: 1, max: 10, index: true },
    credits: { type: Number, default: 3 },
    type: { type: String, enum: ['Core', 'Elective', 'Lab', 'Project', 'Open Elective'], default: 'Core' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    syllabusUrl: { type: String, default: '' },
    description: { type: String, trim: true },
    schedule: [
      {
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
        startTime: String,
        endTime: String,
        room: String,
      },
    ],
  },
  { timestamps: true }
);

subjectSchema.index({ department: 1, semester: 1 });

export default mongoose.model('Subject', subjectSchema);
