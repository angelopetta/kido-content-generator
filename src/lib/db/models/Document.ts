import mongoose, { Schema, Model } from 'mongoose';
import type { IDocument } from '@/types';

const DocumentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileSize: { type: Number, required: true },
    storageKey: { type: String, required: true },
    extractedText: { type: String, required: true },
    category: {
      type: String,
      enum: ['memo', 'policy-position', 'community-input', 'talking-points', 'cowork-output', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DocumentSchema.index({ category: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ createdAt: -1 });

const Document: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default Document;
