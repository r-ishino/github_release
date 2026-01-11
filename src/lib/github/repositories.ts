import type {
  GitHubRepository,
  RepositoryBasic,
  RepositoryWithRelease,
} from '@/types/github';
import { fetchGitHub } from './client';
import { getLatestRelease } from './releases';

export const getRepositoriesBasic = async (): Promise<RepositoryBasic[]> => {
  const repos = await fetchGitHub<GitHubRepository[]>(
    '/user/repos?per_page=100&sort=updated'
  );

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: repo.owner.login,
    description: repo.description,
    private: repo.private,
    html_url: repo.html_url,
    default_branch: repo.default_branch,
  }));
};

export const getRepositories = async (): Promise<RepositoryWithRelease[]> => {
  const repos = await fetchGitHub<GitHubRepository[]>(
    '/user/repos?per_page=100&sort=updated'
  );

  const reposWithRelease = await Promise.all(
    repos.map(async (repo) => {
      const latestRelease = await getLatestRelease(repo.owner.login, repo.name);

      return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        latest_release: latestRelease,
      };
    })
  );

  return reposWithRelease;
};
