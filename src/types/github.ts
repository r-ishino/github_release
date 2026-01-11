export interface GitHubRepository {
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
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
  target_commitish: string;
}

export interface RepositoryWithRelease {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  latest_release: {
    tag_name: string;
    published_at: string;
    days_since_release: number;
  } | null;
}

export interface ReleaseInfo {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
}

export interface CreateReleaseRequest {
  tag_name: string;
  name?: string;
  target_commitish?: string;
  draft?: boolean;
  prerelease?: boolean;
  generate_notes?: boolean;
}

export interface GeneratedNotes {
  name: string;
  body: string;
}
