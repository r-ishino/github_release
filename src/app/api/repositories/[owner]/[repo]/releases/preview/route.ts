import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateReleaseNotes, getLatestRelease } from '@/lib/github';

type RouteParams = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const { owner, repo } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tagName = searchParams.get('tag');
    const targetCommitish = searchParams.get('target') || undefined;

    if (!tagName) {
      return NextResponse.json({ error: 'tag is required' }, { status: 400 });
    }

    const latestRelease = await getLatestRelease(owner, repo);
    const notes = await generateReleaseNotes(
      owner,
      repo,
      tagName,
      targetCommitish,
      latestRelease?.tag_name
    );

    return NextResponse.json({
      name: notes.name,
      body: notes.body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
