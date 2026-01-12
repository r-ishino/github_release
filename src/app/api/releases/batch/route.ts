import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLatestRelease } from '../../../../lib/github';
import type { LatestReleaseInfo } from '../../../../types/github';

type BatchReleaseResponse = {
  [fullName: string]: LatestReleaseInfo | null;
};

export const POST = async (request: NextRequest) => {
  try {
    const { repositories } = (await request.json()) as {
      repositories: { owner: string; name: string; full_name: string }[];
    };

    if (!repositories || !Array.isArray(repositories)) {
      return NextResponse.json(
        { error: 'repositories is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      repositories.map(async (repo) => {
        const release = await getLatestRelease(repo.owner, repo.name);
        return { full_name: repo.full_name, release };
      })
    );

    const response: BatchReleaseResponse = {};
    for (const result of results) {
      response[result.full_name] = result.release;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
