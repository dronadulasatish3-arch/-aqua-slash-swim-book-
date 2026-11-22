// ═══════════════════════════════════════════════════════════════
//  AQUA SLASH — CONFIGURATION
//
//  The app uses email-only login through the Google Apps Script Web App.
//  API_URL is also used for Student Feedback. See google-apps-script/Code.gs
//  for the backend source and deployment instructions.
// ═══════════════════════════════════════════════════════════════

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTlj821Hnng-9cEGaFIlWIzuwUdTz7karYv3XeJUfJWwYJZ44jkR9UtZtv-7eVPdhA/exec';

export const CONFIG = {
  API_URL: SCRIPT_URL,

  /** Pool Levels 1, 2 and 3 are all open — only future environments (Pond/Lake/River/Ocean) are locked. */
  POOL_ACTIVE_LEVELS: 3 as 1 | 2 | 3,

  /** WhatsApp Aqua Slash — 6305252050 → India international format. */
  WHATSAPP_NUMBER: '916305252050',
};
