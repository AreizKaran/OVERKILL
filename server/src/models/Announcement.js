import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Academic', 'Examination', 'Event', 'Placement', 'Administrative', 'Holiday', 'Emergency'],
      default: 'Academic',
    },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    audience: [{ type: String, enum: ['student', 'faculty', 'admin', 'all'], default: 'all' }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Number },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
    attachments: [{ name: String, url: String }],
    publishAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

announcementSchema.index({ publishAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
