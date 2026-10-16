import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fillTemplate, loadTemplate } from '../public/js/lib/template-loader.js';
import { installTemplateFetch } from './helpers/template-fetch.mjs';

installTemplateFetch();

test('all page layouts are separate HTML templates', async () => {
  for (const name of ['landing', 'submit', 'success', 'no-submission', 'track', 'not-found']) {
    const html = await loadTemplate(name);
    assert.ok(html.trim().startsWith('<'));
    assert.doesNotMatch(html, /<script[^>]*>/i);
  }
});

test('template placeholders require explicit values', () => {
  assert.equal(fillTemplate('<p>{{message}}</p>', { message: 'Ready' }), '<p>Ready</p>');
  assert.throws(() => fillTemplate('{{missing}}', {}), /Missing template value/);
});

test('tracking template provides accessible result and dialog markup', async () => {
  const html = await loadTemplate('track');
  assert.match(html, /id="ticket-row-template"/);
  assert.match(html, /id="ticket-detail-template"/);
  assert.match(html, /data-detail-description/);
  assert.match(html, /id="track-form"/);
});

test('success page has the copy button and empty submission fallback', async () => {
  assert.match(await loadTemplate('success'), /id="copy-ticket-id"/);
  assert.match(await loadTemplate('no-submission'), /No recent submission/);
});
