import { readFile } from 'node:fs/promises';

// Unit tests use the actual HTML files without starting an HTTP server.
export function installTemplateFetch() {
  const original = globalThis.fetch;
  globalThis.fetch = async input => {
    const pathname = new URL(input, 'http://localhost').pathname;
    if (!/^\/pages\/[a-z-]+\.html$/.test(pathname)) throw new Error(`Unexpected test URL: ${pathname}`);
    const content = await readFile(new URL(`../../public${pathname}`, import.meta.url), 'utf8');
    return { ok: true, text: async () => content };
  };
  return () => { globalThis.fetch = original; };
}
