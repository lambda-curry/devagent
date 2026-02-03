import '@testing-library/jest-dom/vitest';
import { URLSearchParams as NodeURLSearchParams } from 'node:url';

// Use Node's URLSearchParams so Request/fetch accept it in tests (avoid "Expected init.body to be an instance of URLSearchParams").
if (typeof globalThis.URLSearchParams !== 'undefined') {
  globalThis.URLSearchParams = NodeURLSearchParams as unknown as typeof URLSearchParams;
}

// In Node, Request can reject URLSearchParams from another realm (e.g. from the bundle). Normalize only URLSearchParams to a string so fetcher form submissions work; leave FormData and other body types unchanged.
const OriginalRequest = globalThis.Request;
globalThis.Request = class Request extends OriginalRequest {
  constructor(input: URL | string, init?: RequestInit) {
    let normalizedInit: RequestInit | undefined = init;
    const body = init?.body;
    const isURLSearchParams =
      body != null &&
      typeof (body as { toString?: () => string }).toString === 'function' &&
      (body as { constructor?: { name?: string } }).constructor?.name === 'URLSearchParams';
    if (isURLSearchParams) {
      const text = (body as { toString: () => string }).toString();
      normalizedInit = init ? { ...init, body: text } : { body: text };
      if (text && !init?.headers) {
        normalizedInit.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      } else if (text && init?.headers && !(init.headers as Record<string, string>)['Content-Type']) {
        normalizedInit.headers = { ...(init.headers as Record<string, string>), 'Content-Type': 'application/x-www-form-urlencoded' };
      }
    }
    super(input, normalizedInit);
  }
} as unknown as typeof OriginalRequest;
