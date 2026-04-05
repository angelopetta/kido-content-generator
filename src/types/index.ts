// Core TypeScript type definitions for the KIDO Content Generator

import { Types } from 'mongoose';

// === Enums / Union Types ===

export type ContentType =
  | 'media-strategy'
  | 'press-release'
  | 'social-media'
  | 'political-letter'
  | 'briefing-note'
  | 'talking-points';

export type Tone = 'formal' | 'conversational' | 'urgent' | 'diplomatic';
export type Audience = 'public' | 'government' | 'media' | 'internal';
export type LengthLevel = 'brief' | 'standard' | 'detailed';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type DocumentCategory =
  | 'memo'
  | 'policy-position'
  | 'community-input'
  | 'talking-points'
  | 'cowork-output'
  | 'other';

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram';

// === Generation Parameters ===

export interface GenerationParameters {
  tone: Tone;
  audience: Audience;
  lengthLevel: LengthLevel;
  keyMessages: string[];
  position: string;
}

// === Content Version ===

export interface ContentVersion {
  version: number;
  content: string;
  parameters: GenerationParameters;
  createdAt: Date;
  createdBy: Types.ObjectId | string;
  changeNote?: string;
}

// === Generated Content ===

export interface IGeneratedContent {
  _id: Types.ObjectId | string;
  title: string;
  contentType: ContentType;
  content: string;
  parameters: GenerationParameters;
  sources: {
    articleIds: string[];
    digestIds: string[];
    documentIds: (Types.ObjectId | string)[];
  };
  templateId: Types.ObjectId | string;
  versions: ContentVersion[];
  status: ContentStatus;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// === Document ===

export interface IDocument {
  _id: Types.ObjectId | string;
  name: string;
  originalFilename: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  storageKey: string;
  extractedText: string;
  category: DocumentCategory;
  tags: string[];
  uploadedBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// === Prompt Template ===

export interface IPromptTemplate {
  _id: Types.ObjectId | string;
  name: string;
  contentType: ContentType;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  isDefault: boolean;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// === User ===

export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  hashedPassword: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// === API Response ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// === Generation Request ===

export interface GenerateRequest {
  contentType: ContentType;
  parameters: GenerationParameters;
  sources: {
    articleIds?: string[];
    digestIds?: string[];
    documentIds?: string[];
  };
  templateId?: string;
  additionalContext?: string;
  socialPlatform?: SocialPlatform;
}

// === Intelligence Platform Types ===

export interface PlatformArticle {
  _id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  category: string;
  subcategory?: string;
  relevanceScore: number;
  entities: {
    people: string[];
    organizations: string[];
    legislation: string[];
    jurisdictions: string[];
  };
  tags: string[];
}

export interface PlatformDigest {
  _id: string;
  title: string;
  period: { from: string; to: string };
  content: string;
  articleIds: string[];
  createdAt: string;
}

// === Content Type Metadata ===

export const CONTENT_TYPE_META: Record<ContentType, { label: string; description: string; icon: string }> = {
  'media-strategy': {
    label: 'Media Strategy',
    description: 'Strategic analysis with recommended messaging and media approach',
    icon: '📋',
  },
  'press-release': {
    label: 'Press Release',
    description: 'Formal press release in KIDO\'s organizational voice',
    icon: '📰',
  },
  'social-media': {
    label: 'Social Media',
    description: 'Platform-specific content for X/Twitter, Facebook, Instagram',
    icon: '📱',
  },
  'political-letter': {
    label: 'Political Letter',
    description: 'Formal correspondence to ministers, MPs, and officials',
    icon: '✉️',
  },
  'briefing-note': {
    label: 'Briefing Note',
    description: 'Internal document for leadership with analysis and recommendations',
    icon: '📄',
  },
  'talking-points': {
    label: 'Talking Points',
    description: 'Bullet-point messaging for spokespeople or Chiefs',
    icon: '🎯',
  },
};
