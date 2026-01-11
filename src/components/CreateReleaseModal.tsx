'use client';

import { useState, useEffect, useRef } from 'react';
import type { RepositoryWithRelease } from '@/types/github';

type CreateReleaseModalProps = {
  repository: RepositoryWithRelease;
  nextVersion: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const CreateReleaseModal = ({
  repository,
  nextVersion,
  onClose,
  onSuccess,
}: CreateReleaseModalProps) => {
  const [tagName, setTagName] = useState(nextVersion);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch release notes preview when tag changes
  useEffect(() => {
    if (!tagName.trim()) {
      setReleaseNotes('');
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingNotes(true);
      try {
        const response = await fetch(
          `/api/repositories/${repository.owner}/${repository.name}/releases/preview?tag=${encodeURIComponent(tagName)}&target=${encodeURIComponent(repository.default_branch)}`
        );
        if (response.ok) {
          const data = await response.json();
          setReleaseNotes(data.body || '');
        }
      } catch {
        // Keep existing notes on error
      } finally {
        setIsLoadingNotes(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [tagName, repository.owner, repository.name, repository.default_branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/repositories/${repository.owner}/${repository.name}/releases`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tag_name: tagName,
            target_commitish: repository.default_branch,
            body: releaseNotes,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'リリースの作成に失敗しました');
      }

      const data = await response.json();
      window.open(data.html_url, '_blank');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">新規リリース作成</h2>
        <p className="text-gray-600 mb-4">{repository.full_name}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
              タグ名（バージョン）
            </label>
            <input
              type="text"
              id="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="v1.0.0"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="releaseNotes" className="block text-sm font-medium text-gray-700 mb-1">
              リリースノート
              {isLoadingNotes && (
                <span className="ml-2 text-gray-400 font-normal">読み込み中...</span>
              )}
            </label>
            <textarea
              id="releaseNotes"
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={12}
              placeholder="リリースノートが自動生成されます..."
            />
            <p className="mt-1 text-sm text-gray-500">
              自動生成されたノートを編集できます（Markdown形式）
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              disabled={isSubmitting || isLoadingNotes}
            >
              {isSubmitting ? '作成中...' : 'リリース作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
