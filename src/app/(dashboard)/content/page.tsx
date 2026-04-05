'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CONTENT_TYPE_META } from '@/types';
import type { ContentType, ContentStatus, IGeneratedContent } from '@/types';

export default function ContentLibraryPage() {
  const [items, setItems] = useState<IGeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ContentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterType) params.set('contentType', filterType);
    if (filterStatus) params.set('status', filterStatus);
    if (search) params.set('search', search);

    setLoading(true);
    fetch(`/api/content?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setItems(data.data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterType, filterStatus, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <Link
          href="/generate"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Generate New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ContentType | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
        >
          <option value="">All types</option>
          {Object.entries(CONTENT_TYPE_META).map(([type, meta]) => (
            <option key={type} value={type}>{meta.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ContentStatus | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Content list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No content found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={String(item._id)}
              href={`/content/${item._id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {CONTENT_TYPE_META[item.contentType]?.label} &middot;{' '}
                  {item.parameters.tone} &middot;{' '}
                  {item.parameters.audience} &middot;{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  v{item.versions?.length || 1}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : item.status === 'published'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
