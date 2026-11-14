import { fetchGitHub } from './client';

type GitHubUser = {
  login: string;
};

export const getAuthenticatedUser = (token: string): Promise<GitHubUser> =>
  fetchGitHub<GitHubUser>(token, '/user');
