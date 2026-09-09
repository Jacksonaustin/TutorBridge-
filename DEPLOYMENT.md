# TutorBridge: free Render deployment

The root render.yaml creates ONE Docker Web Service with plan: free.
Dockerfile.render builds React and copies the resulting static files into the
Node backend image. Express serves the website and /api endpoints together.
Your local two-container Compose workflow still works.

## Set up Render

1. Commit and push the changes, including render.yaml, Dockerfile.render,
   .dockerignore, and the backend source changes.
2. In Render, choose New > Blueprint and connect the GitHub repository.
3. Verify the preview shows only one service named tutorbridge with the Free plan.
4. Supply MONGODB_URI for your Atlas database. Render generates SESSION_SECRET.
   Choose an Atlas free cluster if your database also needs to remain free.
5. Add the Render service's outbound IP ranges to Atlas's access list. Retry the
   deployment if its first database connection fails before this is configured.
6. Open the service's assigned HTTPS URL after deployment succeeds.

Render automatically supplies RENDER_EXTERNAL_URL, which the backend uses as its
frontend origin. For a custom domain, add it in Render and set FRONTEND_URL to its
exact HTTPS origin without a trailing slash. Leave PORT at Render's supplied
value. Do not set VITE_API_URL to localhost or upload your local .env file.

If using Render's manual Web Service form instead of a Blueprint:

- Runtime: Docker; instance: Free.
- Root directory: leave empty.
- Dockerfile: ./Dockerfile.render; Docker build context: repository root.
- Health check: /api/health.
- Set MONGODB_URI and a random SESSION_SECRET of at least 32 characters.
- NODE_ENV=production and SERVE_FRONTEND=true are already in the image.

If you previously created the old paid services, changing this file does not
guarantee those services are deleted or stop billing. Inspect the Render dashboard
and explicitly retire them after confirming which service contains your work.
No existing Render services were changed by this repository edit.

## How it works

Browser -> Render HTTPS edge -> Express (React static files + API) -> Atlas.

The frontend uses relative /api URLs. Render terminates HTTPS and Express trusts
its immediate proxy for secure cookies. Cookies remain HttpOnly, Secure, and
SameSite=Lax, and both the page and API share one origin.

Unknown /api routes return JSON 404 responses, never index.html. Frontend page
routes can fall back to index.html. The compiled frontend is included in the image,
while credentials are injected at runtime. The root .dockerignore excludes local
.env files, node_modules, build output, and Git data.

## Free plan limitations

Render free web services sleep after 15 minutes of inactivity. The next request
can take about a minute to wake the service, which matters during class demos.
Free instances have usage limits and temporary local filesystems. Users, sessions,
requests, and messages remain in Atlas, not container storage.
A Free instance does not mean all account usage is unlimited: review the workspace
billing/usage limits and avoid upgrading or enabling paid resources.

See https://render.com/docs/free for current limits and billing behavior.

## Verify after deployment

- Visit /api/health and expect status ok.
- Visit the root URL and refresh a frontend page.
- Test signup, login, refresh, logout, request acceptance, and messaging.
- Check that browser API requests use the same domain, with no localhost URLs.
- Confirm the session cookie is Secure and HttpOnly.
- Test an unrelated account cannot edit requests or access private conversations.
- Test waking the service after inactivity.
- Review logs in Render and check that no secrets are logged.

## Local development

Use npm run dev, or docker compose up --build with backend/.env, as before.
Local Compose still builds backend/Dockerfile and frontend/Dockerfile separately.
The root Dockerfile.render is only for the combined free Render deployment.

Use backend/.env.example as the template for local backend/.env. Render receives
its production environment variables through its dashboard and render.yaml.

## Remaining application release work

- Authentication rate limiting before public registration.
- Prevent duplicate conversations using a unique pair key after auditing existing data.
- Strict calendar-date validation and a clear tutoring-time timezone.
- Automated authentication and permission tests.
- Backup/restore and monitoring procedures for your database.

The free Render configuration is prepared, but the live deployment and account
flows still need verification on your Render account.

References:
https://render.com/docs/blueprint-spec
https://render.com/docs/web-services
https://render.com/docs/free
