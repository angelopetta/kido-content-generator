'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CONTENT_TYPE_META } from '@/types';
import type { ContentType, Tone, Audience, LengthLevel, GenerateRequest } from '@/types';

const TONES: { value: Tone; label: string }[] = [
  { value: 'formal', label: 'Formal' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'diplomatic', label: 'Diplomatic' },
];

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'government', label: 'Government' },
  { value: 'media', label: 'Media' },
  { value: 'internal', label: 'Internal' },
];

const LENGTHS: { value: LengthLevel; label: string; desc: string }[] = [
  { value: 'brief', label: 'Brief', desc: '~1 page' },
  { value: 'standard', label: 'Standard', desc: '2-3 pages' },
  { value: 'detailed', label: 'Detailed', desc: '4+ pages' },
];

type Step = 'type' | 'sources' | 'parameters' | 'generate';

export default function GeneratePageWrapper() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
      <GeneratePage />
    </Suspense>
  );
}

function GeneratePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = searchParams.get('type') as ContentType | null;

  const [step, setStep] = useState<Step>(initialType ? 'sources' : 'type');
  const [contentType, setContentType] = useState<ContentType | null>(initialType);
  const [tone, setTone] = useState<Tone>('formal');
  const [audience, setAudience] = useState<Audience>('public');
  const [lengthLevel, setLengthLevel] = useState<LengthLevel>('standard');
  const [keyMessages, setKeyMessages] = useState('');
  const [position, setPosition] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!contentType) return;
    setIsGenerating(true);
    setGeneratedContent('');

    abortRef.current = new AbortController();

    const request: GenerateRequest = {
      contentType,
      parameters: {
        tone,
        audience,
        lengthLevel,
        keyMessages: keyMessages.split('\n').filter((m) => m.trim()),
        position,
      },
      sources: {
        documentIds: selectedDocIds,
      },
      additionalContext: additionalContext || undefined,
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setGeneratedContent(text);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setGeneratedContent(`Error: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [contentType, tone, audience, lengthLevel, keyMessages, position, additionalContext, selectedDocIds]);

  const handleSave = async () => {
    if (!contentType || !generatedContent || !title.trim()) return;
    setSaving(true);

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contentType,
          content: generatedContent,
          parameters: {
            tone,
            audience,
            lengthLevel,
            keyMessages: keyMessages.split('\n').filter((m) => m.trim()),
            position,
          },
          sources: {
            articleIds: [],
            digestIds: [],
            documentIds: selectedDocIds,
          },
          templateId: null, // Will use default
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/content`);
      }
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generate Content</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['type', 'sources', 'parameters', 'generate'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            <button
              onClick={() => {
                if (s === 'type' || (s === 'sources' && contentType) || (s === 'parameters' && contentType)) {
                  setStep(s);
                }
              }}
              className={`capitalize ${step === s ? 'font-semibold text-gray-900' : 'text-gray-400'}`}
            >
              {s}
            </button>
          </div>
        ))}
      </div>

      {/* Step 1: Content Type */}
      {step === 'type' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.entries(CONTENT_TYPE_META) as [ContentType, typeof CONTENT_TYPE_META[ContentType]][]).map(
            ([type, meta]) => (
              <button
                key={type}
                onClick={() => {
                  setContentType(type);
                  setStep('sources');
                }}
                className={`rounded-lg border p-5 text-left transition-all ${
                  contentType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">{meta.icon}</div>
                <h3 className="mt-2 font-semibold text-gray-900">{meta.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
              </button>
            )
          )}
        </div>
      )}

      {/* Step 2: Sources */}
      {step === 'sources' && (
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Source Material</h2>

          {/* Additional context (paste) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paste context or content
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={8}
              placeholder="Paste article text, memo content, talking points, or any source material..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can also select uploaded documents from the Documents page. Intelligence Platform integration coming in Phase 2.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('type')}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              onClick={() => setStep('parameters')}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Next: Parameters
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Parameters */}
      {step === 'parameters' && (
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Generation Parameters</h2>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tone</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    tone === t.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Audience</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    audience === a.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Length</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLengthLevel(l.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    lengthLevel === l.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {l.label} ({l.desc})
                </button>
              ))}
            </div>
          </div>

          {/* Key messages */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Messages to Emphasize
            </label>
            <textarea
              value={keyMessages}
              onChange={(e) => setKeyMessages(e.target.value)}
              rows={3}
              placeholder="One message per line..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* KIDO position */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              KIDO&apos;s Position / Stance
            </label>
            <textarea
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              rows={2}
              placeholder="KIDO's formal position on this issue..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('sources')}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              onClick={() => {
                setStep('generate');
                handleGenerate();
              }}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Output */}
      {step === 'generate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {contentType ? CONTENT_TYPE_META[contentType]?.label : 'Generated Content'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('parameters')}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Adjust Parameters
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
          </div>

          {/* Content display */}
          <div className="min-h-[300px] rounded-lg border border-gray-200 bg-white p-6">
            {isGenerating && !generatedContent && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Generating content...
              </div>
            )}
            <div className="prose max-w-none whitespace-pre-wrap text-gray-900">
              {generatedContent}
            </div>
            {isGenerating && generatedContent && (
              <span className="inline-block h-4 w-1 animate-pulse bg-gray-400" />
            )}
          </div>

          {/* Save */}
          {generatedContent && !isGenerating && (
            <div className="flex items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this content a title..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save to Library'}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
