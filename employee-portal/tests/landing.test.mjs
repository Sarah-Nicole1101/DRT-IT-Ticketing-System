import { installTemplateFetch } from './helpers/template-fetch.mjs';
installTemplateFetch();


// Import Node.js testing tools.
import assert from 'node:assert/strict';
import test from 'node:test';

// Import the municipal landing page functions.
import { mountLanding, renderLanding } from '../public/js/pages/landing.js';

// Test the landing page content and PIN visibility controls.
test('landing shows municipal notice without displaying the designated PIN', async () => {
  const html = await renderLanding();

  // Verify the municipal landing page elements.
  assert.match(html, /FOR MUNICIPAL OF DRT USE ONLY/);
  assert.match(html, /id="municipal-pin"/);
  assert.match(html, /id="toggle-pin"/);
  assert.match(html, /assets\/drt-official-seal.png/);

  // Ensure the designated PIN is not displayed in the HTML.
  assert.doesNotMatch(html, /3471/);
});

// Test incorrect PIN, correct PIN, and eye icon functionality.
test('PIN screen rejects incorrect PIN and navigates on a correct PIN', () => {
  // Save the original browser objects.
  const originalDocument = globalThis.document;
  const originalSessionStorage = globalThis.sessionStorage;

  // Store simulated event handlers and session data.
  const handlers = new Map();
  const saved = new Map();

  // Mock the municipal PIN form.
  const form = {
    addEventListener: (name, listener) => {
      handlers.set(`form:${name}`, listener);
    },

    removeEventListener: (name) => {
      handlers.delete(`form:${name}`);
    }
  };

  // Mock the PIN input field.
  const pin = {
    value: '',
    type: 'password',

    focus() {},
    setAttribute() {},
    removeAttribute() {},

    addEventListener: (name, listener) => {
      handlers.set(`pin:${name}`, listener);
    },

    removeEventListener: (name) => {
      handlers.delete(`pin:${name}`);
    }
  };

  // Mock the PIN validation message.
  const error = {
    textContent: ''
  };

  // Mock the new Show/Hide PIN eye button.
  const toggle = {
    dataset: {
      visible: 'false'
    },

    attributes: {},

    setAttribute(name, value) {
      this.attributes[name] = value;
    },

    addEventListener(name, listener) {
      handlers.set(`toggle:${name}`, listener);
    },

    removeEventListener(name) {
      handlers.delete(`toggle:${name}`);
    }
  };

  // Simulate the browser's HTML elements.
  globalThis.document = {
    getElementById: id => ({
      'municipal-pin-form': form,
      'municipal-pin': pin,
      'pin-error': error,
      'toggle-pin': toggle
    })[id]
  };

  // Simulate browser session storage.
  globalThis.sessionStorage = {
    getItem: key => saved.get(key) ?? null,

    setItem: (key, value) => {
      saved.set(key, value);
    }
  };

  // Track navigation after entering the correct PIN.
  const nav = [];

  try {
    // Initialize the landing page interactions.
    const cleanup = mountLanding({
      navigate: (...args) => nav.push(args)
    });

    // Check that the PIN is hidden by default.
    assert.equal(pin.type, 'password');

    // Click the eye icon to reveal the PIN.
    handlers.get('toggle:click')();

    assert.equal(pin.type, 'text');
    assert.equal(toggle.dataset.visible, 'true');
    assert.equal(toggle.attributes['aria-label'], 'Hide PIN');

    // Click again to hide the PIN.
    handlers.get('toggle:click')();

    assert.equal(pin.type, 'password');
    assert.equal(toggle.dataset.visible, 'false');
    assert.equal(toggle.attributes['aria-label'], 'Show PIN');

    // Check that an incorrect PIN is rejected.
    pin.value = '0000';

    handlers.get('form:submit')({
      preventDefault() {}
    });

    assert.match(error.textContent, /Incorrect PIN/);
    assert.deepEqual(nav, []);

    // Check that the correct PIN allows navigation.
    pin.value = '3471';

    handlers.get('form:submit')({
      preventDefault() {}
    });

    // Verify navigation to the Submit Ticket page.
    assert.deepEqual(nav, [
      ['/submit', { replace: true }]
    ]);

    // Verify that municipal demo access was granted.
    assert.equal(
      saved.get('drt-municipal-demo-access'),
      'granted'
    );

    // Remove event listeners after the test.
    cleanup();

  } finally {
    // Restore the original browser objects.
    if (originalDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }

    if (originalSessionStorage === undefined) {
      delete globalThis.sessionStorage;
    } else {
      globalThis.sessionStorage = originalSessionStorage;
    }
  }
});
