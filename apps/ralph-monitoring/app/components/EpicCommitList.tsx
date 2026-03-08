import type { EpicActivityItem, ParsedCommitComment } from '~/db/beads.types';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export interface EpicCommitListProps {
  /** Activity items; commits are extracted from comment items with .commit */
  activityItems: EpicActivityItem[];
  /** Base repo URL for commit links (e.g. https://github.com/org/repo). No link when null. */
  repoUrl: string | null;
  /** Optional class name for the card container */
  className?: string;
}

const SHA_DISPLAY_LENGTH = 7;

function extractCommits(items: EpicActivityItem[]): ParsedCommitComment[] {
  const commits: ParsedCommitComment[] = [];
  for (const item of items) {
    if (item.type === 'comment' && item.commit) {
      commits.push(item.commit);
    }
  }
  return commits;
}

function commitHref(repoUrl: string, sha: string): string {
  const base = repoUrl.replace(/\/$/, '');
  return `${base}/commit/${sha}`;
}

export function EpicCommitList({
  activityItems,
  repoUrl,
  className,
}: EpicCommitListProps) {
  const commits = extractCommits(activityItems);

  if (commits.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-[var(--space-2)]">
          <CardTitle className="text-base">Commits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No commits recorded for this epic yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-[var(--space-2)]">
        <CardTitle className="text-base">Commits</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-[var(--space-3)]" aria-label="Commit list">
          {commits.map((commit, index) => {
            const shortSha = commit.sha.slice(0, SHA_DISPLAY_LENGTH);
            const href = repoUrl ? commitHref(repoUrl, commit.sha) : null;
            return (
              <li
                key={`${commit.sha}-${index}`}
                className="flex flex-col gap-[var(--space-0-5)] border-b border-border pb-[var(--space-2)] last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-0-5)]">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                      aria-label={`Commit ${shortSha} on GitHub`}
                    >
                      {shortSha}
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">{shortSha}</span>
                  )}
                </div>
                <p className="text-sm text-foreground">{commit.message}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
