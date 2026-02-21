import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export interface EpicMetaCardProps {
  /** PR URL when available from run file; null when missing or not set */
  prUrl: string | null;
  /** Optional class name for the card container */
  className?: string;
}

export function EpicMetaCard({ prUrl, className }: EpicMetaCardProps) {
  if (prUrl) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-[var(--space-2)]">
          <CardTitle className="text-base">Pull request</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
            aria-label="View pull request on GitHub"
          >
            View PR
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-[var(--space-2)]">
        <CardTitle className="text-base">Pull request</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No PR link for this epic. Set{' '}
          <code className="rounded bg-code-highlight px-[var(--space-1)] py-[var(--space-0-5)] font-mono text-xs text-code-foreground">
            pr_url
          </code>{' '}
          in the run file to
          show a link.
        </p>
      </CardContent>
    </Card>
  );
}
