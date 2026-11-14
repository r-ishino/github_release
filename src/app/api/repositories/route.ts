import { NextResponse } from 'next/server';
import { withGitHubToken } from '../../../lib/auth';
import { getRepositoriesBasic } from '../../../lib/github';

export const GET = withGitHubToken(async (_request, token) => {
  try {
    const repositories = await getRepositoriesBasic(token);
    return NextResponse.json(repositories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
