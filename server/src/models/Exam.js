import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Sessional I', 'Sessional II', 'End Semester', 'Lab Internal', 'Practical', 'Makeup'],
      default: 'Sessional I',
    },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, default: '10:00' },
    durationMinutes: { type: Number, default: 90 },
    room: { type: String, trim: true },
    maxMarks: { type: Number, default: 50 },
    instructions: { type: String, trim: true },
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
