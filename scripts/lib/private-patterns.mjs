// What must never be in a built file or in a page the app serves: keys and secrets anywhere, and
// in what a browser gets also email addresses, a client's name, folder paths of a computer and
// private network addresses. Used by scripts/scan-built.mjs (the built files) and by the browser
// tests (the HTML of every page as the server sends it, also pages drawn per request).

/** Everywhere. */
const SECRETS = [
  ['a private key', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/g],
  ['a Supabase secret or publishable key', /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}/g],
  ['a Supabase service role key', /service_role/g],
  ['a signed token (JWT)', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ['a GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/g],
  ['a cloud access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['a Stripe live key', /\b[rs]k_live_[A-Za-z0-9]{16,}/g],
  ['a Supabase project address', /\b[a-z0-9]{20}\.supabase\.co\b/g],
];

/** True when the text before an address is a library's package data: `maintainers:[{..., email:`. */
function isPackageData(before) {
  return /\b(?:maintainers|author|contributors)\b/.test(before) && /\bemail\W{0,4}$/.test(before);
}

/** Only in what a browser can get (and in the package). */
const SERVED = [
  // Any address with a dot after the @, except GitHub's noreply addresses and example domains.
  // Sample content has none. A library's own package data (its author or maintainers) that a
  // bundle carries is public and not ours: it is let through.
  [
    'an email address',
    /\b[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com|example\.(?:com|org|net)\b)[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[A-Za-z]\b/g,
    (text, index) => isPackageData(text.slice(Math.max(0, index - 200), index)),
  ],
  ['a client name (Woqoof)', /woqoof/gi],
  [
    'a folder path of a computer',
    /[A-Za-z]:\\\\?Users\\\\?|\/Users\/[^/\s"']+\/|\/home\/(?!runner\b)[^/\s"']+\//g,
  ],
  [
    'a private network address',
    /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g,
  ],
];

/**
 * Every finding in a text, as `[what, count]`, never the text that was found. `served` (the
 * default) adds the checks for what a browser gets.
 */
export function privateFindings(text, served = true) {
  const findings = [];
  for (const [what, pattern, allowed] of served ? [...SECRETS, ...SERVED] : SECRETS) {
    const count = [...text.matchAll(pattern)].filter(
      (match) => !allowed?.(text, match.index ?? 0)
    ).length;
    if (count > 0) {
      findings.push([what, count]);
    }
  }
  return findings;
}
