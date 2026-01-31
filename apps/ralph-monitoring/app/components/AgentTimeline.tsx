import { Link, href } from 'react-router';
import { useState, useMemo } from 'react';
import type { RalphExecutionLog } from '~/db/beads.types';
import { cn, formatDurationMs } from '~/lib/utils';

/** Execution log status for timeline blocks; uses design system semantic tokens (DESIGN_LANGUAGE.md) */
const BLOCK_STATUS_COLORS: Record<RalphExecutionLog['status'], string> = {
  success: 'bg-muted',
  failed: 'bg-destructive',
  running: 'bg-primary',
};

const MIN_BLOCK_WIDTH_PCT = 4;
/** Block height on 4px grid: --space-6 (24px) per DESIGN_LANGUAGE spacing scale */
const BLOCK_HEIGHT = 24;

export interface AgentTimelineProps {
  /** Execution log rows (e.g. from getExecutionLogs(epicId)), ordered by started_at DESC */
  logs: RalphExecutionLog[];
  /** Task ID → display title for tooltip and accessibility */
  taskIdToTitle: Record<string, string>;
  /** Optional class name for the container */
  className?: string;
}

interface BlockLayout {
  log: RalphExecutionLog;
  leftPct: number;
  widthPct: number;
  durationMs: number | null;
}

function computeBlockLayouts(
  logs: RalphExecutionLog[],
  rangeStartMs: number,
  rangeEndMs: number
): BlockLayout[] {
  const rangeMs = Math.max(rangeEndMs - rangeStartMs, 1);
  return logs.map((log) => {
    const startMs = new Date(log.started_at).getTime();
    const endMs = log.ended_at ? new Date(log.ended_at).getTime() : rangeEndMs;
    const durationMs = log.ended_at ? endMs - startMs : null;
    const leftPct = ((startMs - rangeStartMs) / rangeMs) * 100;
    let widthPct = ((endMs - startMs) / rangeMs) * 100;
    if (widthPct < MIN_BLOCK_WIDTH_PCT) widthPct = MIN_BLOCK_WIDTH_PCT;
    return { log, leftPct, widthPct, durationMs };
  });
}

function formatStatusLabel(status: RalphExecutionLog['status']): string {
  switch (status) {
    case 'success':
      return 'Success';
    case 'failed':
      return 'Failed';
    case 'running':
      return 'In progress';
    default:
      return status;
  }
}

export function AgentTimeline({ logs, taskIdToTitle, className }: AgentTimelineProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const { rangeStartMs, rangeEndMs, byAgent } = useMemo(() => {
    if (logs.length === 0) {
      return { rangeStartMs: 0, rangeEndMs: 1, byAgent: new Map<string, RalphExecutionLog[]>() };
    }
    const now = Date.now();
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const log of logs) {
      const start = new Date(log.started_at).getTime();
      const end = log.ended_at ? new Date(log.ended_at).getTime() : now;
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    }
    if (minStart === maxEnd) maxEnd = minStart + 1;
    const byAgentMap = new Map<string, RalphExecutionLog[]>();
    for (const log of logs) {
      const list = byAgentMap.get(log.agent_type) ?? [];
      list.push(log);
      byAgentMap.set(log.agent_type, list);
    }
    for (const list of byAgentMap.values()) {
      list.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    }
    return { rangeStartMs: minStart, rangeEndMs: maxEnd, byAgent: byAgentMap };
  }, [logs]);

  const agentRows = useMemo(() => {
    return Array.from(byAgent.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [byAgent]);

  if (logs.length === 0) {
    return (
      <output
        className={cn('block rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground', className)}
        aria-label="No agent activity"
      >
        No agent activity to display.
      </output>
    );
  }

  return (
    <div
      className={cn('rounded-lg border border-border bg-background overflow-x-auto', className)}
      role="img"
      aria-label="Agent activity timeline"
    >
      <div className="min-w-[400px] p-4">
        {agentRows.map(([agentType, agentLogs]) => {
          const layouts = computeBlockLayouts(agentLogs, rangeStartMs, rangeEndMs);
          return (
            <div
              key={agentType}
              className="flex items-center gap-3 py-1"
              data-testid={`timeline-row-${agentType}`}
            >
              <div className="w-28 shrink-0 text-sm font-medium text-foreground capitalize">
                {agentType.replace(/-/g, ' ')}
              </div>
              <div className="relative flex-1 h-8" style={{ minHeight: BLOCK_HEIGHT }}>
                {layouts.map(({ log, leftPct, widthPct, durationMs }) => {
                  const key = `${log.task_id}-${log.started_at}`;
                  const title = taskIdToTitle[log.task_id] ?? log.task_id;
                  const colorClass = BLOCK_STATUS_COLORS[log.status];
                  const isHovered = hoveredKey === key;
                  return (
                    <Link
                      key={key}
                      to={href('/tasks/:taskId', { taskId: log.task_id })}
                      className={cn(
                        'absolute top-0 rounded overflow-hidden',
                        'opacity-90 hover:opacity-100 focus-visible:opacity-100',
                        'transition-opacity motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        colorClass,
                        isHovered && 'opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background'
                      )}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        minWidth: 8,
                        height: BLOCK_HEIGHT,
                      }}
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      title={`${title} — ${formatStatusLabel(log.status)}${durationMs != null ? ` · ${formatDurationMs(durationMs)}` : ''}`}
                      aria-label={`Task: ${title}, ${formatStatusLabel(log.status)}. Go to task.`}
                    >
                      {isHovered && (
                        <div
                          className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 min-w-[140px] max-w-[280px] rounded-md border border-border bg-popover px-2 py-1.5 text-xs text-popover-foreground shadow-[var(--shadow-2)]"
                          role="tooltip"
                        >
                          <div className="font-medium">{title}</div>
                          <div className="text-muted-foreground">
                            {formatStatusLabel(log.status)}
                            {durationMs != null ? ` · ${formatDurationMs(durationMs)}` : ''}
                          </div>
                          <div className="font-mono text-muted-foreground">{log.task_id}</div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
