import mongoose from 'mongoose';

const SlideSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadDate: { type: String, required: true },
  fileSize: { type: String, required: true },
  fileType: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Slide || mongoose.model('Slide', SlideSchema);
