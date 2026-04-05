'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONTENT_TYPE_META } from '@/types';
import type { ContentType, IGeneratedContent } from '@/types';

export default function DashboardPage() {
  const [recentContent, setRecentContent] = useState<IGeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?limit=5')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecentContent(data.data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate communications content from intelligence and source documents.
        </p>
      </div>

      {/* Quick generate cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Generate</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(CONTENT_TYPE_META) as [ContentType, typeof CONTENT_TYPE_META[ContentType]][]).map(
            ([type, meta]) => (
              <Link
                key={type}
                href={`/generate?type=${type}`}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-2xl">{meta.icon}</div>
                <h3 className="mt-2 font-semibold text-gray-900">{meta.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Recent content */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Content</h2>
          <Link href="/content" className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        ) : recentContent.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">
              No content generated yet. Click a content type above to get started.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentContent.map((item) => (
              <Link
                key={String(item._id)}
                href={`/content/${item._id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {CONTENT_TYPE_META[item.contentType]?.label} &middot;{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
