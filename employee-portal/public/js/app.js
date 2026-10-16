// Import the new municipal PIN landing page.
import { hasMunicipalAccess, mountLanding, renderLanding } from './pages/landing.js';

// Import the Submit Ticket page and its interactions.
import { mountSubmit, renderSubmit } from './pages/submit.js';

// Import the submission confirmation page.
import { mountSuccess, renderSuccess } from './pages/success.js';

// Import the Track Ticket page and its interactions.
import { mountTrack, renderTrack } from './pages/track.js';

// Define the Employee Portal pages.
const routes = new Map([
  ['/', { render: renderLanding, mount: mountLanding, title: 'Municipal Access' }],
  ['/submit', { render: renderSubmit, mount: mountSubmit, title: 'Submit Ticket' }],
  ['/submit/success', { render: renderSuccess, mount: mountSuccess, title: 'Submission Complete' }],
  ['/track', { render: renderTrack, mount: mountTrack, title: 'Track Ticket' }],
]);

// Get the main page container and keep the current cleanup function.
const root = document.querySelector('#app');
let cleanup = null;

// Display the page that matches the current URL.
function renderRoute() {
  // Release resources and listeners from the previous page.
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  const requestedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  let path = requestedPath;

  // Show the PIN screen when a visitor tries to open a page without access.
  if (!hasMunicipalAccess() && path !== '/') {
    path = '/';
    history.replaceState(null, '', '/');
  }

  // Skip the PIN screen within a session that has already passed the check.
  if (hasMunicipalAccess() && path === '/') {
    path = '/submit';
    history.replaceState(null, '', '/submit');
  }

  // Hide the shared header and footer only on the PIN landing screen.
  document.body.classList.toggle('is-landing', path === '/');

  const route = routes.get(path);

  // Display a simple error for unknown routes after access is granted.
  if (!route) {
    root.innerHTML = `
      <div class="container narrow">
        <section class="panel submission-result">
          <h1>Page not found</h1>
          <p>We couldn't find that page.</p>
          <a href="/submit" data-link class="button primary">Submit Ticket</a>
        </section>
      </div>
    `;
    document.title = 'Page Not Found — DRT IT Ticketing';
    return;
  }

  // Render the page and activate its form or buttons.
  root.innerHTML = route.render();
  cleanup = route.mount?.({ navigate }) ?? null;
  document.title = `${route.title} — DRT IT Ticketing`;
}

// Navigate between pages without a full browser reload.
export function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);

  renderRoute();
  window.scrollTo(0, 0);
}

// Intercept standard internal navigation link clicks.
document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[data-link]');

  // Preserve browser actions such as Ctrl-click and external links.
  if (
    !link ||
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0 ||
    link.origin !== location.origin ||
    link.target === '_blank' ||
    link.hasAttribute('download')
  ) {
    return;
  }

  event.preventDefault();
  navigate(link.pathname + link.search);
});

// Respond to the browser's Back and Forward buttons.
window.addEventListener('popstate', renderRoute);

// Load the first page.
renderRoute();
