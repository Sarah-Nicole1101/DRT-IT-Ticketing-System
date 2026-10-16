// Application router: HTML templates are loaded separately from page logic.
import { loadTemplate } from './lib/template-loader.js';
import { hasMunicipalAccess } from './services/access-service.js';
import { renderLanding, mountLanding } from './pages/landing.js';
import { renderSubmit, mountSubmit } from './pages/submit.js';
import { renderSuccess, mountSuccess } from './pages/success.js';
import { renderTrack, mountTrack } from './pages/track.js';

const routes = new Map([
  ['/', { render: renderLanding, mount: mountLanding, title: 'Municipal Access' }],
  ['/submit', { render: renderSubmit, mount: mountSubmit, title: 'Submit Ticket' }],
  ['/submit/success', { render: renderSuccess, mount: mountSuccess, title: 'Submission Complete' }],
  ['/track', { render: renderTrack, mount: mountTrack, title: 'Track Ticket' }],
]);

const root = document.querySelector('#app');
let cleanup = null;
let navigationVersion = 0;

// Loading is asynchronous because each page now lives in its own HTML file.
async function renderRoute() {
  const version = ++navigationVersion;
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  let path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (!hasMunicipalAccess() && path !== '/') {
    path = '/';
    history.replaceState(null, '', '/');
  }
  if (hasMunicipalAccess() && path === '/') {
    path = '/submit';
    history.replaceState(null, '', '/submit');
  }

  document.body.classList.toggle('is-landing', path === '/');
  const route = routes.get(path);
  document.title = `${route?.title ?? 'Page Not Found'} — DRT IT Ticketing`;

  try {
    const html = route ? await route.render() : await loadTemplate('not-found');
    if (version !== navigationVersion) return; // Ignore stale navigation responses.
    root.innerHTML = html;
    cleanup = route?.mount?.({ navigate }) ?? null;
  } catch (error) {
    if (version !== navigationVersion) return;
    console.error('Unable to display page:', error);
    root.innerHTML = '<div class="container narrow"><section class="panel submission-result"><h1>Page unavailable</h1><p>Please refresh the page to try again.</p></section></div>';
  }
}

// Support the existing SPA links without full reloads.
export function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  void renderRoute();
  window.scrollTo(0, 0);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[data-link]');
  if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey ||
      event.shiftKey || event.altKey || event.button !== 0 ||
      link.origin !== location.origin || link.target === '_blank' ||
      link.hasAttribute('download')) return;

  event.preventDefault();
  navigate(link.pathname + link.search);
});

window.addEventListener('popstate', () => { void renderRoute(); });
void renderRoute();
