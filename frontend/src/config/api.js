// Empty in production sends requests to the website's own HTTPS origin.
export const API_URL = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/+$/, '')
