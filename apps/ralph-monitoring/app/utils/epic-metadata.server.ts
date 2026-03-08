/**
 * Epic metadata from run files: PR URL and optional repo URL.
 * Missing or ambiguous run files do not throw; prUrl/repoUrl are null when unavailable.
 */

import { findRunFileByEpicId, readRunFileEpic } from '~/utils/loop-start.server';

export interface EpicMetadata {
  prUrl: string | null;
  repoUrl: string | null;
}

const REPO_URL_ENV = 'RALPH_REPO_URL';

/**
 * Return repo URL from explicit config (env RALPH_REPO_URL). Optional.
 */
export function getRepoUrl(): string | null {
  const url = process.env[REPO_URL_ENV]?.trim();
  return url && url.length > 0 ? url : null;
}

/**
 * Get epic metadata for the given epic ID: prUrl from run file (when present), repoUrl from env.
 * Missing or ambiguous run files, invalid JSON, or missing epic do not break the epic view;
 * prUrl is null in those cases.
 */
export function getEpicMetadata(epicId: string): EpicMetadata {
  const repoUrl = getRepoUrl();
  const runPath = findRunFileByEpicId(epicId);
  if (!runPath) {
    return { prUrl: null, repoUrl };
  }
  try {
    const epic = readRunFileEpic(runPath);
    const prUrl =
      epic?.pr_url != null && typeof epic.pr_url === 'string' && epic.pr_url.trim() !== ''
        ? epic.pr_url.trim()
        : null;
    return { prUrl, repoUrl };
  } catch {
    return { prUrl: null, repoUrl };
  }
}
