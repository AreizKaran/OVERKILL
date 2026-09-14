import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: {
      type: String,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor', 'HOD'],
      default: 'Assistant Professor',
    },
    officialEmail: { type: String, lowercase: true, trim: true },
    cabin: { type: String, trim: true },
    block: { type: String, trim: true },
    contact: { type: String, trim: true },
    qualification: { type: String, trim: true },
    specialization: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    joiningDate: { type: Date },
    officeHours: { type: String, trim: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    isMentor: { type: Boolean, default: false },
    bio: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Retired'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.model('Faculty', facultySchema);
