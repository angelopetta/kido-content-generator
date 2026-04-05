import mongoose, { Schema, Model } from 'mongoose';
import type { IPromptTemplate } from '@/types';

const PromptTemplateSchema = new Schema<IPromptTemplate>(
  {
    name: { type: String, required: true },
    contentType: {
      type: String,
      enum: ['media-strategy', 'press-release', 'social-media', 'political-letter', 'briefing-note', 'talking-points'],
      required: true,
    },
    systemPrompt: { type: String, required: true },
    userPromptTemplate: { type: String, required: true },
    variables: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PromptTemplateSchema.index({ contentType: 1, isDefault: 1 });

const PromptTemplate: Model<IPromptTemplate> =
  mongoose.models.PromptTemplate ||
  mongoose.model<IPromptTemplate>('PromptTemplate', PromptTemplateSchema);

export default PromptTemplate;
