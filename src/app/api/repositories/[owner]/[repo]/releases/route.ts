import { NextResponse } from 'next/server';
import {
  getReleases,
  getLatestRelease,
  generateReleaseNotes,
  createRelease,
  calculateNextVersion,
} from '@/lib/github';
import type { CreateReleaseRequest } from '@/types/github';

interface RouteParams {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { owner, repo } = await params;
    const [releases, latestRelease] = await Promise.all([
      getReleases(owner, repo),
      getLatestRelease(owner, repo),
    ]);

    const nextVersion = latestRelease
      ? calculateNextVersion(latestRelease.tag_name)
      : 'v0.0.1';

    return NextResponse.json({
      repository: {
        full_name: `${owner}/${repo}`,
      },
      releases: releases.map((release) => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        published_at: release.published_at,
        html_url: release.html_url,
      })),
      next_version: nextVersion,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { owner, repo } = await params;
    const body = (await request.json()) as CreateReleaseRequest;

    if (!body.tag_name) {
      return NextResponse.json({ error: 'tag_name is required' }, { status: 400 });
    }

    let releaseBody = '';

    if (body.generate_notes) {
      const latestRelease = await getLatestRelease(owner, repo);
      const notes = await generateReleaseNotes(
        owner,
        repo,
        body.tag_name,
        body.target_commitish,
        latestRelease?.tag_name
      );
      releaseBody = notes.body;
    }

    const release = await createRelease(owner, repo, body.tag_name, {
      name: body.name || body.tag_name,
      body: releaseBody,
      targetCommitish: body.target_commitish,
      draft: body.draft,
      prerelease: body.prerelease,
    });

    return NextResponse.json({
      id: release.id,
      tag_name: release.tag_name,
      name: release.name,
      body: release.body,
      html_url: release.html_url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
