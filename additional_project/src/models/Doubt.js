import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const DoubtSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentRoll: { type: String, required: true },
  studentAvatar: { type: String },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.models.Doubt || mongoose.model('Doubt', DoubtSchema);
