import { NextResponse } from 'next/server';
import { withGitHubToken } from '../../../../../../lib/auth';
import {
  calculateNextVersion,
  createRelease,
  generateReleaseNotes,
  getLatestRelease,
  getReleases,
} from '../../../../../../lib/github';
import type { CreateReleaseRequest } from '../../../../../../types/github';

type RouteParams = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export const GET = withGitHubToken(
  async (_request, token, { params }: RouteParams) => {
    try {
      const { owner, repo } = await params;
      const [releases, latestRelease] = await Promise.all([
        getReleases(token, owner, repo),
        getLatestRelease(token, owner, repo),
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
  },
);

export const POST = withGitHubToken(
  async (request, token, { params }: RouteParams) => {
    try {
      const { owner, repo } = await params;
      const reqBody = (await request.json()) as CreateReleaseRequest;

      if (!reqBody.tag_name) {
        return NextResponse.json(
          { error: 'tag_name is required' },
          { status: 400 },
        );
      }

      let releaseBody = reqBody.body || '';

      // Only generate notes if body is not provided and generate_notes is true
      if (!reqBody.body && reqBody.generate_notes) {
        const latestRelease = await getLatestRelease(token, owner, repo);
        const notes = await generateReleaseNotes(
          token,
          owner,
          repo,
          reqBody.tag_name,
          reqBody.target_commitish,
          latestRelease?.tag_name,
        );
        releaseBody = notes.body;
      }

      const release = await createRelease(
        token,
        owner,
        repo,
        reqBody.tag_name,
        {
          name: reqBody.name || reqBody.tag_name,
          body: releaseBody,
          targetCommitish: reqBody.target_commitish,
          draft: reqBody.draft,
          prerelease: reqBody.prerelease,
        },
      );

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
  },
);
