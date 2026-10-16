import test from 'node:test';
import assert from 'node:assert/strict';
import { installTemplateFetch } from './helpers/template-fetch.mjs';
import { renderSuccess } from '../public/js/pages/success.js';
import { renderSubmit } from '../public/js/pages/submit.js';
import { renderTrack } from '../public/js/pages/track.js';

installTemplateFetch();

test('submit template fills its office list and image limits', async () => {
  const html = await renderSubmit();
  assert.match(html, /value="SBO"/);
  assert.match(html, /Maximum 3 photos/);
  assert.doesNotMatch(html, /\{\{\w+\}\}/);
});

test('success page shows escaped user data and keeps the saved reference', async () => {
  const original = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem: () => JSON.stringify({
      reference: 'TKT-2026-10-001', office: 'SBO',
      name: '<img src=x onerror=alert(1)>', time: '2026-10-16T06:30:00Z'
    })
  };
  try {
    const html = await renderSuccess();
    assert.match(html, /TKT-2026-10-001/);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(html, /<img src=x onerror/);
    assert.match(html, /href="\/track\?office=SBO"/);
    assert.doesNotMatch(html, /\{\{\w+\}\}/);
  } finally {
    if (original === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = original;
  }
});

test('track template escapes values passed through URL query', async () => {
  const original = globalThis.window;
  globalThis.window = { location: { search: '?id=%3Cimg%20src%3Dx%3E' } };
  try {
    const html = await renderTrack();
    assert.match(html, /value="&lt;img src=x&gt;"/);
    assert.doesNotMatch(html, /value="<img/);
    assert.doesNotMatch(html, /\{\{\w+\}\}/);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});
