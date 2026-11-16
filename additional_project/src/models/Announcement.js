import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true, maxlength: 150 },
  body: { type: String, required: true, maxlength: 4000 },
  // 'General' for the whole batch, otherwise a course code like 'DBMS'
  subject: { type: String, default: 'General' },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
  pinned: { type: Boolean, default: false },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorSubject: { type: String }
}, { timestamps: true });

if (mongoose.models.Announcement) mongoose.deleteModel('Announcement');

export default mongoose.model('Announcement', AnnouncementSchema);
