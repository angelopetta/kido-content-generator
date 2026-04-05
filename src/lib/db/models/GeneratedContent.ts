import mongoose, { Schema, Model } from 'mongoose';
import type { IGeneratedContent } from '@/types';

const ContentVersionSchema = new Schema(
  {
    version: { type: Number, required: true },
    content: { type: String, required: true },
    parameters: {
      tone: { type: String, enum: ['formal', 'conversational', 'urgent', 'diplomatic'], required: true },
      audience: { type: String, enum: ['public', 'government', 'media', 'internal'], required: true },
      lengthLevel: { type: String, enum: ['brief', 'standard', 'detailed'], required: true },
      keyMessages: [{ type: String }],
      position: { type: String, default: '' },
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changeNote: { type: String },
  },
  { _id: false }
);

const GeneratedContentSchema = new Schema<IGeneratedContent>(
  {
    title: { type: String, required: true },
    contentType: {
      type: String,
      enum: ['media-strategy', 'press-release', 'social-media', 'political-letter', 'briefing-note', 'talking-points'],
      required: true,
    },
    content: { type: String, required: true },
    parameters: {
      tone: { type: String, enum: ['formal', 'conversational', 'urgent', 'diplomatic'], required: true },
      audience: { type: String, enum: ['public', 'government', 'media', 'internal'], required: true },
      lengthLevel: { type: String, enum: ['brief', 'standard', 'detailed'], required: true },
      keyMessages: [{ type: String }],
      position: { type: String, default: '' },
    },
    sources: {
      articleIds: [{ type: String }],
      digestIds: [{ type: String }],
      documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    },
    templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', required: true },
    versions: [ContentVersionSchema],
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

GeneratedContentSchema.index({ contentType: 1, status: 1 });
GeneratedContentSchema.index({ createdBy: 1 });
GeneratedContentSchema.index({ createdAt: -1 });

const GeneratedContent: Model<IGeneratedContent> =
  mongoose.models.GeneratedContent ||
  mongoose.model<IGeneratedContent>('GeneratedContent', GeneratedContentSchema);

export default GeneratedContent;
