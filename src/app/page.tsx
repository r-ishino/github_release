'use client';

import { useState } from 'react';
import { CreateReleaseModal } from '../components/CreateReleaseModal';
import { useFavorites } from '../hooks/useFavorites';
import {
  SearchHeader,
  Pagination,
  LoadingSkeleton,
  EmptyState,
  RepositoryGrid,
  useRepositories,
  useReleases,
  useDiffStatus,
} from './_repository';
import type { RepositoryWithRelease } from '../types/github';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const [selectedRepo, setSelectedRepo] = useState<RepositoryWithRelease | null>(null);
  const [nextVersion, setNextVersion] = useState('v0.0.1');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  const { repositories, loading, error, invalidate } = useRepositories();

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

  const { releases, loading: releasesLoading } = useReleases({
    repositories: paginatedRepositories,
  });

  const { diffStatuses, loading: diffLoading } = useDiffStatus({
    repositories: paginatedRepositories,
    releases,
  });

  const paginatedRepositoriesWithRelease: RepositoryWithRelease[] = paginatedRepositories.map(
    (repo) => ({
      ...repo,
      latest_release: releases[repo.full_name] ?? null,
    })
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
    invalidate();
  };

  if (loading) {
    return <LoadingSkeleton />;
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
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filteredCount={sortedRepositories.length}
        totalCount={repositories.length}
      />

      {sortedRepositories.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <RepositoryGrid
          repositories={paginatedRepositoriesWithRelease}
          releases={releases}
          diffStatuses={diffStatuses}
          releasesLoading={releasesLoading}
          diffLoading={diffLoading}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onCreateRelease={handleCreateRelease}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

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
