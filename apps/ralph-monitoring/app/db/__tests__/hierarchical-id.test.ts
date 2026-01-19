import { describe, expect, it } from 'vitest';
import { compareHierarchicalIds, parseHierarchicalId } from '../hierarchical-id';

describe('hierarchical-id', () => {
  it('parses hierarchical ids into base + numeric segments', () => {
    expect(parseHierarchicalId('devagent-69fc.16')).toEqual({
      base: 'devagent-69fc',
      segments: [16],
    });
    expect(parseHierarchicalId('devagent-69fc.5.2')).toEqual({
      base: 'devagent-69fc',
      segments: [5, 2],
    });
  });

  it('sorts numeric hierarchical suffixes numerically (2 < 10)', () => {
    const ids = ['devagent-69fc.1', 'devagent-69fc.10', 'devagent-69fc.2'];
    const sorted = [...ids].sort(compareHierarchicalIds);
    expect(sorted).toEqual(['devagent-69fc.1', 'devagent-69fc.2', 'devagent-69fc.10']);
  });

  it('sorts shorter paths before deeper descendants when prefixes match', () => {
    const ids = ['devagent-69fc.1.2', 'devagent-69fc.1', 'devagent-69fc.1.10'];
    const sorted = [...ids].sort(compareHierarchicalIds);
    expect(sorted).toEqual(['devagent-69fc.1', 'devagent-69fc.1.2', 'devagent-69fc.1.10']);
  });
});

