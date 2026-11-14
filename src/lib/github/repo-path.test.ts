import { describe, expect, it } from 'vitest';
import { repoPath } from './repo-path';

describe('repoPath', () => {
  it('owner と repo から GitHub API のリポジトリのパスを作る', () => {
    expect(repoPath('mozu-inc', 'github_release.v2')).toBe(
      '/repos/mozu-inc/github_release.v2',
    );
  });

  it.each([
    ['/ で別の API に向けるもの', 'prod/releases'],
    ['? で後ろをクエリにするもの', 'prod?'],
    ['親ディレクトリ', '..'],
    ['カレントディレクトリ', '.'],
    ['空文字', ''],
  ])(
    'GitHub の名前に使えない値(%s)は、リクエストを組み立てる前に例外にする',
    (_, repo) => {
      expect(() => repoPath('mozu-inc', repo)).toThrow('Invalid repo');
    },
  );

  it('owner も同じ規則で検査する', () => {
    expect(() => repoPath('../user', 'repo')).toThrow('Invalid owner');
  });
});
