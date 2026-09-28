/**
 * formatTxDate.js
 * Formats a Date (or ISO string) into the DizzitUp display format.
 * Example output: "28 Sep 2026 • 18:24"
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {Date|string|null} date - Date object, ISO string, or null for "now"
 * @returns {string} e.g. "28 Sep 2026 • 18:24"
 */
export function formatTxDate(date = null) {
  const d = date ? new Date(date) : new Date();
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} • ${hours}:${minutes}`;
}
