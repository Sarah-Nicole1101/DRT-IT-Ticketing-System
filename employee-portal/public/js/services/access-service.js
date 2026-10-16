// DEMO ONLY: A browser-visible PIN is not access security.
// Move verification, session management, and rate limiting to Express later.
const DEMO_PIN = '3471';
const ACCESS_KEY = 'drt-municipal-demo-access';

export function isValidDemoPin(pin) {
  return pin === DEMO_PIN;
}

export function hasMunicipalAccess() {
  return sessionStorage.getItem(ACCESS_KEY) === 'granted';
}

export function grantDemoAccess() {
  sessionStorage.setItem(ACCESS_KEY, 'granted');
}
