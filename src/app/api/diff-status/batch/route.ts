import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDiffStatus } from '@/lib/github';
import type { DiffStatus } from '@/types/github';

type BatchDiffStatusResponse = {
  [fullName: string]: DiffStatus;
};

type RepositoryInput = {
  owner: string;
  name: string;
  full_name: string;
  tag_name: string;
  default_branch: string;
};

export const POST = async (request: NextRequest) => {
  try {
    const { repositories } = (await request.json()) as {
      repositories: RepositoryInput[];
    };

    if (!repositories || !Array.isArray(repositories)) {
      return NextResponse.json(
        { error: 'repositories is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      repositories.map(async (repo) => {
        const diffStatus = await getDiffStatus(
          repo.owner,
          repo.name,
          repo.tag_name,
          repo.default_branch
        );
        return { full_name: repo.full_name, diffStatus };
      })
    );

    const response: BatchDiffStatusResponse = {};
    for (const result of results) {
      response[result.full_name] = result.diffStatus;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
