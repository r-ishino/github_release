'use client';

import { useEffect, useState, useRef } from 'react';
import { RepositoryCard } from '@/components/RepositoryCard';
import { CreateReleaseModal } from '@/components/CreateReleaseModal';
import { useFavorites } from '@/hooks/useFavorites';
import type { RepositoryBasic, RepositoryWithRelease, LatestReleaseInfo, DiffStatus } from '@/types/github';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const [repositories, setRepositories] = useState<RepositoryBasic[]>([]);
  const [releases, setReleases] = useState<Record<string, LatestReleaseInfo | null>>({});
  const [diffStatuses, setDiffStatuses] = useState<Record<string, DiffStatus>>({});
  const [loading, setLoading] = useState(true);
  const [releasesLoading, setReleasesLoading] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryWithRelease | null>(null);
  const [nextVersion, setNextVersion] = useState('v0.0.1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const fetchedPagesRef = useRef<Set<string>>(new Set());
  const fetchedDiffPagesRef = useRef<Set<string>>(new Set());

  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is used to trigger refetch
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        setReleases({});
        setDiffStatuses({});
        fetchedPagesRef.current = new Set();
        fetchedDiffPagesRef.current = new Set();
        const response = await fetch('/api/repositories');
        if (!response.ok) {
          throw new Error('リポジトリの取得に失敗しました');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [refreshKey]);

  const filteredRepositories = searchQuery.trim()
    ? repositories.filter((repo) => {
        const query = searchQuery.toLowerCase();
        return (
          repo.name.toLowerCase().includes(query) ||
          repo.owner.toLowerCase().includes(query) ||
          repo.full_name.toLowerCase().includes(query) ||
          (repo.description?.toLowerCase().includes(query) ?? false)
        );
      })
    : repositories;

  const sortedRepositories = isLoaded
    ? [...filteredRepositories].sort((a, b) => {
        const aFav = isFavorite(a.full_name) ? 1 : 0;
        const bFav = isFavorite(b.full_name) ? 1 : 0;
        return bFav - aFav;
      })
    : filteredRepositories;

  const totalPages = Math.ceil(sortedRepositories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRepositories = sortedRepositories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Fetch releases for current page repositories
  useEffect(() => {
    const reposToFetch = paginatedRepositories.filter(
      (repo) => !(repo.full_name in releases)
    );

    if (reposToFetch.length === 0) return;

    const cacheKey = reposToFetch.map((r) => r.full_name).join(',');
    if (fetchedPagesRef.current.has(cacheKey)) return;
    fetchedPagesRef.current.add(cacheKey);

    const fetchReleases = async () => {
      setReleasesLoading(true);
      try {
        const response = await fetch('/api/releases/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repositories: reposToFetch.map((repo) => ({
              owner: repo.owner,
              name: repo.name,
              full_name: repo.full_name,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setReleases((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Ignore release fetch errors
      } finally {
        setReleasesLoading(false);
      }
    };

    fetchReleases();
  }, [paginatedRepositories, releases]);

  // Fetch diff status for repositories with releases
  useEffect(() => {
    const reposWithReleases = paginatedRepositories.filter(
      (repo) => releases[repo.full_name]?.tag_name && !(repo.full_name in diffStatuses)
    );

    if (reposWithReleases.length === 0) return;

    const cacheKey = reposWithReleases.map((r) => r.full_name).join(',');
    if (fetchedDiffPagesRef.current.has(cacheKey)) return;
    fetchedDiffPagesRef.current.add(cacheKey);

    const fetchDiffStatuses = async () => {
      setDiffLoading(true);
      try {
        const response = await fetch('/api/diff-status/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repositories: reposWithReleases.map((repo) => ({
              owner: repo.owner,
              name: repo.name,
              full_name: repo.full_name,
              tag_name: releases[repo.full_name]?.tag_name,
              default_branch: repo.default_branch,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDiffStatuses((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Ignore diff fetch errors
      } finally {
        setDiffLoading(false);
      }
    };

    fetchDiffStatuses();
  }, [paginatedRepositories, releases, diffStatuses]);

  const paginatedRepositoriesWithRelease: RepositoryWithRelease[] = paginatedRepositories.map(
    (repo) => ({
      ...repo,
      latest_release: releases[repo.full_name] ?? null,
    })
  );

  const handleCreateRelease = async (repository: RepositoryWithRelease) => {
    try {
      const response = await fetch(
        `/api/repositories/${repository.owner}/${repository.name}/releases`
      );
      if (response.ok) {
        const data = await response.json();
        setNextVersion(data.next_version);
      }
    } catch {
      // デフォルトのバージョンを使用
    }
    setSelectedRepo(repository);
  };

  const handleModalClose = () => {
    setSelectedRepo(null);
  };

  const handleReleaseSuccess = () => {
    setSelectedRepo(null);
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-xl font-semibold text-gray-800">リポジトリ一覧</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="検索..."
            className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-64"
          />
        </div>
        <p className="text-gray-500 text-sm">
          {searchQuery ? `${sortedRepositories.length} / ${repositories.length} 件` : `${repositories.length} 件のリポジトリ`}
        </p>
      </div>

      {sortedRepositories.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          {searchQuery ? `「${searchQuery}」に一致するリポジトリはありません` : 'リポジトリがありません'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paginatedRepositoriesWithRelease.map((repo) => (
            <RepositoryCard
            key={repo.id}
            repository={repo}
            isFavorite={isFavorite(repo.full_name)}
            onToggleFavorite={toggleFavorite}
            onCreateRelease={handleCreateRelease}
            isLoadingRelease={releasesLoading && !(repo.full_name in releases)}
            diffStatus={diffStatuses[repo.full_name]}
            isLoadingDiff={diffLoading && !(repo.full_name in diffStatuses)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 transition-colors"
          >
            前へ
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                  currentPage === page
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 transition-colors"
          >
            次へ
          </button>
        </div>
      )}

      {selectedRepo && (
        <CreateReleaseModal
          repository={selectedRepo}
          nextVersion={nextVersion}
          onClose={handleModalClose}
          onSuccess={handleReleaseSuccess}
        />
      )}
    </div>
  );
};

export default Home;
