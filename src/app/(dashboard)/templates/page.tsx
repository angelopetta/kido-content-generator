'use client';

import { useEffect, useState } from 'react';
import { CONTENT_TYPE_META } from '@/types';
import type { IPromptTemplate } from '@/types';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<IPromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IPromptTemplate | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplates(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
      <p className="text-sm text-gray-600">
        Prompt templates control how content is generated. Each content type has a default template.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">
            No templates found. Run the seed endpoint to create defaults:
          </p>
          <code className="mt-2 block text-sm text-gray-600">
            GET /api/templates/seed?secret=CRON_SECRET
          </code>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Template list */}
          <div className="space-y-2 lg:col-span-1">
            {templates.map((tmpl) => (
              <button
                key={String(tmpl._id)}
                onClick={() => setSelected(tmpl)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?._id === tmpl._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-gray-900">{tmpl.name}</p>
                <p className="text-xs text-gray-500">
                  {CONTENT_TYPE_META[tmpl.contentType]?.label}
                  {tmpl.isDefault && ' (default)'}
                </p>
              </button>
            ))}
          </div>

          {/* Template detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                  <p className="text-sm text-gray-500">
                    {CONTENT_TYPE_META[selected.contentType]?.label}
                    {selected.isDefault && ' — Default template'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">System Prompt</h4>
                  <pre className="mt-1 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                    {selected.systemPrompt}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">User Prompt Template</h4>
                  <pre className="mt-1 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                    {selected.userPromptTemplate}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Variables</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.variables.map((v) => (
                      <span key={v} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                Select a template to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
