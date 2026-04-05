'use client';

import { useEffect, useState, useCallback } from 'react';
import type { IDocument, DocumentCategory } from '@/types';

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'memo', label: 'Internal Memo' },
  { value: 'policy-position', label: 'Policy Position' },
  { value: 'community-input', label: 'Community Input' },
  { value: 'talking-points', label: 'Talking Points' },
  { value: 'cowork-output', label: 'Cowork Output' },
  { value: 'other', label: 'Other' },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('other');
  const [dragOver, setDragOver] = useState(false);

  const fetchDocs = useCallback(() => {
    setLoading(true);
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDocuments(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);

      try {
        await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });
      } catch {
        // Error handled silently
      }
    }

    setUploading(false);
    fetchDocs();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchDocs();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <p className="text-sm text-gray-600">
          Drag and drop files here, or{' '}
          <label className="cursor-pointer text-blue-600 hover:text-blue-800">
            browse
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF, DOCX, TXT (max 10MB)</p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <label className="text-xs text-gray-500">Category:</label>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-900"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {uploading && (
          <p className="mt-2 text-sm text-blue-600">Uploading...</p>
        )}
      </div>

      {/* Document list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={String(doc._id)}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-500">
                  {doc.originalFilename} &middot; {doc.fileType.toUpperCase()} &middot;{' '}
                  {(doc.fileSize / 1024).toFixed(0)} KB &middot;{' '}
                  {CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                </p>
                {doc.extractedText && (
                  <p className="mt-1 text-xs text-gray-400 truncate">
                    {doc.extractedText.slice(0, 150)}...
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(String(doc._id))}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
