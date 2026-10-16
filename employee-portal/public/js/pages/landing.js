
// Frontend-only PIN demonstration. Production verification needs a server.
const DEMO_PIN = '3471';
const ACCESS_KEY = 'drt-municipal-demo-access';

// Check whether the current browser tab has municipal access.
export function hasMunicipalAccess() {
  return sessionStorage.getItem(ACCESS_KEY) === 'granted';
}

// Display the municipal PIN landing page.
export function renderLanding() {
  return `
    <section class="municipal-landing" aria-labelledby="landing-title">
      <div class="municipal-access-card">

        <!-- Municipal branding and welcome heading. -->
        <img
          class="municipal-seal"
          src="/assets/drt-official-seal.png"
          alt="Municipality of Doña Remedios Trinidad official seal"
        />

        <p class="municipal-eyebrow">Municipal Employee Access</p>
        <div class="municipal-divider" aria-hidden="true"><span>◆</span></div>

        <h1 id="landing-title">
          WELCOME TO
          <br />
          <em>DRT</em> MUNICIPAL
          <br />
          TICKETING SYSTEM
        </h1>

        <!-- Municipal PIN form with Show/Hide PIN button. -->
        <form id="municipal-pin-form" class="municipal-pin-form" novalidate>
          <label for="municipal-pin">ENTER PIN</label>

          <div class="municipal-pin-input-wrap">
            <input
              id="municipal-pin"
              name="pin"
              type="password"
              inputmode="numeric"
              autocomplete="off"
              pattern="[0-9]{4}"
              minlength="4"
              maxlength="4"
              placeholder="Enter your IT-Assigned Municipal Pin"
              aria-describedby="pin-error"
              required
            />

            <!-- Toggle PIN visibility using eye icons. -->
            <button
              type="button"
              id="toggle-pin"
              class="municipal-pin-toggle"
              aria-label="Show PIN"
              aria-pressed="false"
              aria-controls="municipal-pin"
              data-visible="false"
            >
              <!-- Eye icon: Show PIN. -->
              <svg data-icon="show" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="M2.062 12.348a1 1 0 0 1 0-.696
                  10.75 10.75 0 0 1 19.876 0
                  1 1 0 0 1 0 .696
                  10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <!-- Crossed-out eye icon: Hide PIN. -->
              <svg data-icon="hide" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="m3 3 18 18" />
                <path d="M10.58 10.59a2 2 0 0 0 2.83 2.83" />
                <path d="M9.88 5.09A10.75 10.75 0 0 1
                  21.94 11.65a1 1 0 0 1 0 .7
                  11.8 11.8 0 0 1-4.07 4.9" />
                <path d="M6.6 6.6a11.8 11.8 0 0 0-4.54 5.05
                  1 1 0 0 0 0 .7
                  10.75 10.75 0 0 0 14.56 5.25" />
              </svg>
            </button>
          </div>

          <p id="pin-error" class="municipal-pin-error"
            role="alert" aria-live="polite"></p>

          <button type="submit" class="municipal-continue">
            Continue <span aria-hidden="true">→</span>
          </button>
        </form>

        <!-- Municipal-only access notice. -->
        <div class="municipal-only-notice">
          <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.9"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" focusable="false">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>FOR MUNICIPAL OF DRT USE ONLY</span>
        </div>

        <!-- IT Admin assistance reminder. -->
        <p class="municipal-help">
          <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.9"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>
            If you don't have the PIN, please contact your IT Admin.
          </span>
        </p>

      </div>
    </section>
  `;
}

// Handle PIN visibility and municipal access validation.
export function mountLanding({ navigate }) {
  const form = document.getElementById('municipal-pin-form');
  const pinField = document.getElementById('municipal-pin');
  const errorField = document.getElementById('pin-error');
  const toggleButton = document.getElementById('toggle-pin');

  // Show or hide the PIN without clearing the entered value.
  function togglePinVisibility() {
    const isVisible = pinField.type === 'password';

    pinField.type = isVisible ? 'text' : 'password';

    toggleButton.dataset.visible = String(isVisible);
    toggleButton.setAttribute('aria-pressed', String(isVisible));
    toggleButton.setAttribute(
      'aria-label',
      isVisible ? 'Hide PIN' : 'Show PIN'
    );
  }

  // Validate the entered PIN and open ticket submission.
  function handleSubmit(event) {
    event.preventDefault();

    const pin = pinField.value.trim();

    // Require exactly four digits.
    if (!/^\d{4}$/.test(pin)) {
      errorField.textContent = 'Please enter a valid municipal PIN.';
      pinField.setAttribute('aria-invalid', 'true');
      pinField.focus();
      return;
    }

    // Reject an incorrect PIN.
    if (pin !== DEMO_PIN) {
      errorField.textContent =
        'Incorrect PIN. Please ask your IT Admin for assistance.';

      pinField.setAttribute('aria-invalid', 'true');
      pinField.value = '';
      pinField.focus();
      return;
    }

    // Allow access to the Employee Portal for this browser tab.
    sessionStorage.setItem(ACCESS_KEY, 'granted');
    pinField.value = '';

    navigate('/submit', { replace: true });
  }

  // Clear validation errors when the employee types again.
  function handleInput() {
    errorField.textContent = '';
    pinField.removeAttribute('aria-invalid');
  }

  // Connect the form and eye icon interactions.
  form.addEventListener('submit', handleSubmit);
  pinField.addEventListener('input', handleInput);
  toggleButton.addEventListener('click', togglePinVisibility);

  // Remove event listeners when leaving the landing page.
  return () => {
    form.removeEventListener('submit', handleSubmit);
    pinField.removeEventListener('input', handleInput);
    toggleButton.removeEventListener('click', togglePinVisibility);
  };
}
