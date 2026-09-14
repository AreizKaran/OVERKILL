import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    school: { type: String, default: 'Sikkim Manipal Institute of Technology' },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    block: { type: String, trim: true },
    description: { type: String, trim: true },
    establishedYear: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
