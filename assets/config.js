/* Fill these before the site goes public. Empty means "not ready": the site then says so honestly
   instead of showing a fake button, store badge or login. Never put a key or secret here. */
window.METANOIA_SITE = {
  // Where the pilot / contact form is POSTed as JSON (e.g. a Formspree URL or our own /api route).
  formEndpoint: "",
  // Public contact address. Used by the form (mailto) when formEndpoint is empty, and on the Contact page.
  contactEmail: "",
  // The Institution Portal, only once it is really live. Empty → "pilot access by invitation".
  portalUrl: "",
  // Store links, only once the app is really on the stores.
  appStoreUrl: "",
  playStoreUrl: ""
};
