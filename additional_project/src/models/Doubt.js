import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  // Text is optional when the message carries attachments (e.g. a photo of the question)
  text: { type: String, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
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
