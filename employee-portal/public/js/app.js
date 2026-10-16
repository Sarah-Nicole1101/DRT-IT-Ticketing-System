
// Import the Submit Ticket page and its interactions.
import { mountSubmit, renderSubmit } from './pages/submit.js';

// Import the submission confirmation page.
import { mountSuccess, renderSuccess } from './pages/success.js';

// Import the Track Ticket page and its interactions.
import { mountTrack, renderTrack } from './pages/track.js';

// Define the available Employee Portal routes.
const routes = new Map([
  ['/', { render: renderSubmit, mount: mountSubmit, title: 'Submit Ticket' }],
  ['/submit', { render: renderSubmit, mount: mountSubmit, title: 'Submit Ticket' }],
  ['/submit/success', { render: renderSuccess, mount: mountSuccess, title: 'Submission Complete' }],
  ['/track', { render: renderTrack, mount: mountTrack, title: 'Track Ticket' }],
]);

// Get the main container where pages will be displayed.
const root = document.querySelector('#app');

// Store the cleanup function of the current page.
let cleanup = null;

// Render the correct page based on the current URL.
function renderRoute() {
  // Remove event handlers or resources from the previous page.
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  // Get the current URL path and remove trailing slashes.
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  // Find the corresponding route.
  const route = routes.get(path);

  // Display a fallback page if the route does not exist.
  if (!route) {
    root.innerHTML = `
      <div class="container narrow">
        <section class="panel submission-result">

          <!-- Display a message for an invalid page. -->
          <h1>Page not found</h1>
          <p>We couldn't find that page.</p>

          <!-- Return to the Submit Ticket page. -->
          <a href="/" data-link class="button primary">
            Submit Ticket
          </a>

        </section>
      </div>
    `;

    // Update the browser title for an invalid route.
    document.title = 'Page Not Found — DRT IT Ticketing';
    return;
  }

  // Display the selected page inside the main container.
  root.innerHTML = route.render();

  // Initialize page-specific interactions when available.
  cleanup = route.mount?.({ navigate }) ?? null;

  // Update the browser tab title.
  document.title = `${route.title} — DRT IT Ticketing`;
}

// Navigate between pages without reloading the website.
export function navigate(path) {
  // Update the browser URL.
  history.pushState(null, '', path);

  // Display the page associated with the new URL.
  renderRoute();

  // Scroll to the top after navigation.
  window.scrollTo(0, 0);
}

// Handle navigation links within the Employee Portal.
document.addEventListener('click', (event) => {
  // Find the nearest navigation link clicked by the user.
  const link = event.target.closest?.('a[data-link]');

  // Allow normal browser behavior for special or external links.
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

  // Prevent a full page reload for internal navigation.
  event.preventDefault();

  // Open the selected page using the router.
  navigate(link.pathname + link.search);
});

// Handle browser Back and Forward navigation.
window.addEventListener('popstate', renderRoute);

// Display the correct page when the website first loads.
renderRoute();
