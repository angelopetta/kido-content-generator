import * as mammoth from 'mammoth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type ParsedDocument = {
  text: string;
  fileType: 'pdf' | 'docx' | 'txt';
  metadata: {
    pageCount?: number;
    title?: string;
  };
};

/**
 * Parse a document file buffer and extract text content.
 */
export async function parseDocument(
  buffer: Buffer,
  filename: string
): Promise<ParsedDocument> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return parsePdf(buffer);
    case 'docx':
      return parseDocx(buffer);
    case 'txt':
      return parseTxt(buffer);
    default:
      throw new Error(`Unsupported file type: .${ext}. Supported: PDF, DOCX, TXT`);
  }
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  return {
    text: data.text.trim(),
    fileType: 'pdf',
    metadata: {
      pageCount: data.numpages,
      title: data.info?.Title || undefined,
    },
  };
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value.trim(),
    fileType: 'docx',
    metadata: {},
  };
}

async function parseTxt(buffer: Buffer): Promise<ParsedDocument> {
  return {
    text: buffer.toString('utf-8').trim(),
    fileType: 'txt',
    metadata: {},
  };
}

/**
 * Validate that a file is an allowed type.
 */
export function validateFileType(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ['pdf', 'docx', 'txt'].includes(ext || '');
}
