export interface ParsedHierarchicalId {
  base: string;
  segments: Array<number | string>;
}

function parseSegment(segment: string): number | string {
  if (!segment) return '';
  if (/^\d+$/.test(segment)) return Number(segment);
  return segment;
}

export function parseHierarchicalId(id: string): ParsedHierarchicalId {
  const [base, ...rest] = id.split('.');
  return {
    base: base ?? id,
    segments: rest.map(parseSegment),
  };
}

export function compareHierarchicalIds(leftId: string, rightId: string): number {
  if (leftId === rightId) return 0;

  const left = parseHierarchicalId(leftId);
  const right = parseHierarchicalId(rightId);

  if (left.base !== right.base) return left.base.localeCompare(right.base);

  const max = Math.max(left.segments.length, right.segments.length);
  for (let i = 0; i < max; i += 1) {
    const a = left.segments[i];
    const b = right.segments[i];

    if (a === undefined && b === undefined) break;
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    if (a === b) continue;

    if (typeof a === 'number' && typeof b === 'number') return a - b;

    return String(a).localeCompare(String(b));
  }

  // Deterministic final fallback
  return leftId.localeCompare(rightId);
}
