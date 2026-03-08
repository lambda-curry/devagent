import type { EpicActivityItem } from '~/db/beads.types';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export interface EpicActivityProps {
  /** Unified activity items (execution, comment, status), most recent first */
  items: EpicActivityItem[];
  /** Task ID → display title for labels */
  taskIdToTitle: Record<string, string>;
  /** Optional class name for the card container */
  className?: string;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

function typeLabel(item: EpicActivityItem): string {
  switch (item.type) {
    case 'execution':
      return 'Execution';
    case 'comment':
      return 'Comment';
    case 'status':
      return 'Status';
    default:
      return 'Activity';
  }
}

function itemSummary(item: EpicActivityItem, taskIdToTitle: Record<string, string>): string {
  switch (item.type) {
    case 'execution': {
      const title = taskIdToTitle[item.task_id] ?? item.task_id;
      return `${item.agent_type}: ${title} (${item.status})`;
    }
    case 'comment': {
      if (item.commit) return item.commit.message;
      const firstLine = item.body.split('\n')[0]?.trim() ?? '';
      return firstLine.slice(0, 80) + (firstLine.length > 80 ? '…' : '');
    }
    case 'status':
      return `${item.title} → ${item.status}`;
    default:
      return '';
  }
}

export function EpicActivity({ items, taskIdToTitle, className }: EpicActivityProps) {
  if (items.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-[var(--space-2)]">
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity for this epic.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-[var(--space-2)]">
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-[var(--space-3)]" aria-label="Recent activity">
          {items.slice(0, 20).map((item, index) => {
            const key =
              item.type === 'comment'
                ? `comment-${item.comment_id}`
                : item.type === 'execution'
                  ? `exec-${item.task_id}-${item.started_at}-${index}`
                  : `status-${item.task_id}-${item.timestamp}`;
            return (
              <li
                key={key}
                className="flex flex-col gap-[var(--space-0-5)] border-b border-border pb-[var(--space-2)] last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-0-5)]">
                  <span className="text-xs font-medium text-muted-foreground">
                    {typeLabel(item)}
                  </span>
                  <span className="text-xs text-muted-foreground" aria-hidden>
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{itemSummary(item, taskIdToTitle)}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
