import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('orch-verify', () => {
  it('reads and verifies data from Epic A', () => {
    // Read the JSON file created by Epic A
    // Resolve path relative to project root (apps/ralph-monitoring)
    const projectRoot = process.cwd();
    const filePath = join(projectRoot, 'public', 'orch-test.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Assert the content matches what Epic A created
    expect(data).toEqual({ hello: 'world' });
  });
});
