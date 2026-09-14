import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    registrationNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true, min: 1, max: 10, index: true },
    section: { type: String, default: 'A', uppercase: true },
    batch: { type: String, trim: true },
    admissionYear: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    bloodGroup: { type: String, trim: true },
    category: { type: String, trim: true },
    hostel: {
      resident: { type: Boolean, default: false },
      block: String,
      roomNo: String,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
      email: String,
      occupation: String,
    },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    status: { type: String, enum: ['Active', 'Alumni', 'Suspended', 'On Leave'], default: 'Active' },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
