export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
};

export type GitHubRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
  target_commitish: string;
};

export type RepositoryBasic = {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
};

export type LatestReleaseInfo = {
  tag_name: string;
  published_at: string;
  days_since_release: number;
};

export type RepositoryWithRelease = RepositoryBasic & {
  latest_release: LatestReleaseInfo | null;
};

export type ReleaseInfo = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
};

export type CreateReleaseRequest = {
  tag_name: string;
  name?: string;
  body?: string;
  target_commitish?: string;
  draft?: boolean;
  prerelease?: boolean;
  generate_notes?: boolean;
};

export type GeneratedNotes = {
  name: string;
  body: string;
};

export type GitHubCompareResponse = {
  status: 'ahead' | 'behind' | 'identical' | 'diverged';
  ahead_by: number;
  behind_by: number;
};

export type DiffStatus = {
  hasChanges: boolean;
  commitsAhead: number;
};
