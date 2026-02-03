import '@testing-library/jest-dom/vitest';
import { URLSearchParams as NodeURLSearchParams } from 'node:url';

if (typeof globalThis.URLSearchParams !== 'undefined') {
  globalThis.URLSearchParams = NodeURLSearchParams as unknown as typeof URLSearchParams;
}
