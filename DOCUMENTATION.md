# TutorBridge Complete Project Documentation

## 1. Project summary

TutorBridge is a web application that connects students who need academic help
with students who are willing to tutor. A user can create an account, post a
tutoring request, browse requests, accept a request as a tutor, and communicate
through one-to-one conversations.

The current application is a minimum viable product (MVP). It includes the core
frontend, API, database, authentication, request-management, messaging,
containerization, and Render deployment flows.

## 2. Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React | Builds the interactive user interface |
| Frontend tooling | Vite | Runs the development server and produces the production build |
| Styling | Tailwind CSS | Provides utility classes and application styling |
| Backend | Node.js and Express | Runs the HTTP API and application logic |
| Database mapping | Mongoose | Defines schemas and communicates with MongoDB |
| Database | MongoDB Atlas | Stores users, sessions, tutoring requests, conversations, and messages |
| Authentication | `express-session` and `connect-mongo` | Maintains server-side login sessions in MongoDB |
| Password security | `bcryptjs` | Hashes passwords and verifies login attempts |
| Local containers | Docker Compose | Runs separate frontend and backend containers locally |
| Production container | Docker | Builds the frontend and backend into one Render image |
| Hosting | Render | Hosts the production web service |

## 3. System architecture

### Local development

```text
Browser
  |-- http://localhost:5173 --> React/Vite frontend
  |-- http://localhost:5000 --> Express API
                                    |
                                    v
                              MongoDB Atlas
```

The frontend and backend are separate processes during ordinary local
development. The frontend uses `VITE_API_URL` to reach the backend, and the
browser includes the session cookie in authenticated requests.

### Render production

```text
Browser
   |
   v
Render HTTPS endpoint
   |
   v
One Express container
   |-- serves the compiled React files
   |-- handles /api/* requests
   |
   v
MongoDB Atlas
```

The production build uses one container because the project is deployed as one
free Render Web Service. React still executes in the user's browser; Express
only serves its compiled static files. Frontend API requests use relative
`/api/...` URLs, so the page and API share the same HTTPS origin.

## 4. Repository structure

```text
TutorBridge-/
|-- backend/
|   |-- index.js                     # Connects to MongoDB and starts Express
|   |-- Dockerfile                   # Backend-only local Docker image
|   |-- .env.example                 # Safe environment-variable template
|   `-- src/
|       |-- app.js                   # Express configuration and route mounting
|       |-- config/
|       |   |-- db.js                # MongoDB connection
|       |   `-- serveFrontend.js     # Serves React in the combined image
|       |-- controllers/             # Endpoint application logic
|       |-- middleware/              # Authentication and error handling
|       |-- models/                  # Mongoose database schemas
|       |-- routes/                  # API URL and controller mappings
|       `-- utils/                   # Input-validation functions
|-- frontend/
|   |-- Dockerfile                   # Frontend-only local Docker image
|   |-- nginx.conf                   # Serves the local container's React build
|   `-- src/
|       |-- App.jsx                  # Top-level state and session check
|       |-- components/              # Application screens and UI components
|       `-- config/api.js            # Development/production API base URL
|-- compose.yaml                     # Local two-container configuration
|-- Dockerfile.render                # Combined production image
|-- render.yaml                      # Render Blueprint configuration
|-- README.md                        # Short project introduction
|-- DEPLOYMENT.md                    # Detailed Render instructions
`-- DOCUMENTATION.md                 # Complete technical documentation
```

## 5. Backend design

The backend follows a route-controller-model structure:

1. A route matches an HTTP method and URL.
2. Authentication middleware rejects unauthenticated requests when required.
3. A controller validates input and performs the requested operation.
4. A Mongoose model reads or writes MongoDB data.
5. The controller sends a JSON response.
6. Unexpected errors are passed to the shared error handler.

For example, creating a tutoring request follows this path:

```text
POST /api/requests
  -> requestRoutes.js
  -> requireAuth.js
  -> requestController.createRequest()
  -> requestValidation.js
  -> TutoringRequest model
  -> MongoDB requests collection
  -> 201 JSON response
```

### Server startup

`backend/index.js` connects to MongoDB before opening the HTTP port. If the
database connection fails, startup fails instead of running an API that cannot
store or retrieve data. Express listens on `0.0.0.0`, which allows it to receive
traffic inside Docker and on Render.

### Application configuration

`backend/src/app.js` configures:

- the public health endpoint;
- CORS for the configured frontend origin;
- JSON request bodies with a 20 KB limit;
- MongoDB-backed login sessions;
- authentication, request, and conversation routes;
- optional production frontend file serving;
- JSON 404 responses; and
- centralized error handling.

## 6. Authentication and sessions

TutorBridge uses server-side session authentication.

### Signup flow

1. The API validates the submitted name, email, password, and optional major.
2. The email is trimmed and converted to lowercase.
3. The API checks whether the email is already registered.
4. `bcryptjs` hashes the password with a cost factor of 12.
5. Only the resulting `passwordHash` is stored; the plain password is not stored.
6. Express regenerates the session to prevent session fixation.
7. The user's ID is stored in the server-side session.
8. A safe public user object is returned without the password hash.

### Login flow

1. The API validates the email and password format.
2. The user is looked up by normalized email.
3. `bcryptjs` compares the submitted password with the stored hash.
4. A new authenticated session is generated and saved.
5. The browser receives the session cookie.

The same generic `Invalid email or password` response is returned when either
the email or password is wrong. This avoids revealing which email addresses are
registered.

### Authenticated requests

The cookie identifies a session stored in MongoDB. `requireAuth` checks for the
session's `userId` before protected controllers run. Controllers also enforce
authorization rules, such as request ownership and conversation membership.

Authentication answers **who the user is**. Authorization answers **what that
user is allowed to do**.

### Cookie configuration

The cookie is named `tutorbridge.sid` and has the following properties:

| Setting | Purpose |
| --- | --- |
| `HttpOnly` | Prevents frontend JavaScript from reading the cookie |
| `SameSite=Lax` | Reduces cross-site request risks |
| `Secure` in production | Sends the cookie only over HTTPS |
| 24-hour maximum age | Expires the login session after one day |

Production trusts Render's immediate proxy so secure cookies work after Render
terminates HTTPS.

## 7. API conventions

The local API base URL is `http://localhost:5000`. In production, the API uses
the deployed site's origin. All request bodies are JSON unless stated otherwise.

For routes marked **Required**, the client must include the session cookie. In
the frontend this is done with:

```js
fetch(url, {
  credentials: "include",
});
```

### Common response codes

| Code | Meaning in this application |
| --- | --- |
| `200 OK` | A read or update succeeded |
| `201 Created` | A user, request, conversation, or message was created |
| `204 No Content` | Logout or deletion succeeded without a response body |
| `400 Bad Request` | The body, query, ID, or field format is invalid |
| `401 Unauthorized` | Login failed or an authenticated session is required |
| `404 Not Found` | The resource is missing or inaccessible to that user |
| `409 Conflict` | A duplicate or invalid state transition occurred |
| `500 Internal Server Error` | An unexpected server error occurred |
| `503 Service Unavailable` | The health endpoint reports that MongoDB is not ready |

Validation errors generally use one of these shapes:

```json
{ "errors": ["A valid email is required."] }
```

```json
{ "message": "Authentication required." }
```

Unknown `/api` routes return JSON rather than the React page:

```json
{ "message": "Endpoint not found." }
```

## 8. API endpoint reference

### Health endpoint

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Reports whether the MongoDB connection is ready |

Successful response:

```json
{ "status": "ok" }
```

If MongoDB is unavailable, the endpoint returns `503` with
`{"status":"unavailable"}`.

### Authentication endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Creates a user and starts a session |
| `POST` | `/api/auth/login` | No | Verifies credentials and starts a session |
| `POST` | `/api/auth/logout` | Required | Destroys the current session |
| `GET` | `/api/auth/me` | Required | Returns the currently signed-in user |

#### `POST /api/auth/signup`

Request body:

```json
{
  "name": "Test Student",
  "email": "student@example.com",
  "password": "password123",
  "major": "Computer Science"
}
```

`major` is optional. A valid password contains at least 8 characters and no
more than 72 UTF-8 bytes. Successful signup returns `201`:

```json
{
  "user": {
    "id": "USER_OBJECT_ID",
    "name": "Test Student",
    "email": "student@example.com",
    "major": "Computer Science",
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
}
```

Duplicate email addresses return `409`.

#### `POST /api/auth/login`

Request body:

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Successful login returns `200` with the same safe `user` shape used by signup.
Incorrect credentials return `401`.

#### `GET /api/auth/me`

Returns `200` with `{ "user": ... }` while the session is valid. It returns
`401` when there is no authenticated session.

#### `POST /api/auth/logout`

Destroys the stored session, clears the browser cookie, and returns `204`.

### Tutoring-request endpoints

All tutoring-request endpoints require authentication.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/requests` | Creates a tutoring request |
| `GET` | `/api/requests` | Lists browseable tutoring requests |
| `GET` | `/api/requests/mine` | Lists requests involving the current user |
| `GET` | `/api/requests/:id` | Gets one tutoring request |
| `PATCH` | `/api/requests/:id` | Edits the owner's pending request |
| `POST` | `/api/requests/:id/accept` | Accepts a pending request as tutor |
| `POST` | `/api/requests/:id/cancel` | Cancels the owner's active request |
| `POST` | `/api/requests/:id/complete` | Completes an assigned accepted request |
| `DELETE` | `/api/requests/:id` | Deletes the owner's pending or cancelled request |

#### `POST /api/requests`

Request body:

```json
{
  "subject": "Computer Science",
  "topic": "Python Functions",
  "description": "I need help understanding nested functions.",
  "requestedDate": "2026-09-15",
  "requestedTime": "3:30 PM"
}
```

`requestedTime` accepts 24-hour values such as `15:30` or 12-hour values such
as `3:30 PM`. The authenticated user's ID becomes `studentId`. New requests
start with `status: "pending"` and `tutorId: null`.

#### `GET /api/requests`

Without query parameters, this returns pending and accepted requests sorted by
requested date and creation date. Optional filters are:

```text
GET /api/requests?status=pending
GET /api/requests?subject=Computer%20Science
GET /api/requests?status=accepted&subject=Computer%20Science
```

Allowed statuses are `pending`, `accepted`, `completed`, and `cancelled`.

#### `PATCH /api/requests/:id`

The owner can edit only these fields while the request is pending:

- `subject`
- `topic`
- `description`
- `requestedDate`
- `requestedTime`

The endpoint rejects empty updates and ignores fields outside that list.

#### Request lifecycle and permissions

```text
created -> pending -> accepted -> completed
               |          |
               `----------+----> cancelled

pending or cancelled --owner deletion--> removed
```

- A student cannot accept their own request.
- Only an unassigned pending request can be accepted.
- Accepting uses one atomic database update, preventing two tutors from both
  successfully accepting the same request.
- Only the student who created a pending or accepted request can cancel it.
- The assigned student or tutor can complete an accepted request.
- Only the owner can permanently delete a pending or cancelled request.

### Conversation and message endpoints

All conversation and message endpoints require authentication.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/conversations` | Lists the current user's conversations |
| `POST` | `/api/conversations` | Finds or creates a one-to-one conversation |
| `GET` | `/api/conversations/:conversationId` | Gets one conversation |
| `GET` | `/api/conversations/:conversationId/messages` | Lists a page of messages |
| `POST` | `/api/conversations/:conversationId/messages` | Sends a message |
| `POST` | `/api/conversations/:conversationId/read` | Marks received messages as read |

#### `POST /api/conversations`

Request body:

```json
{ "participantId": "OTHER_USER_OBJECT_ID" }
```

Users cannot start conversations with themselves. If a conversation already
exists for the pair, the endpoint returns it with `200` and `created: false`.
Otherwise, it returns the new conversation with `201` and `created: true`.

#### `GET /api/conversations/:conversationId/messages`

The default page contains up to 50 messages, returned from oldest to newest.
The maximum page size is 100. Older messages can be requested with:

```text
GET /api/conversations/CONVERSATION_ID/messages?limit=50&before=2026-09-10T12:00:00.000Z
```

#### `POST /api/conversations/:conversationId/messages`

Request body:

```json
{ "text": "Would 3:30 PM work for you?" }
```

Message text must be non-empty and no longer than 2,000 characters. The API
derives the receiver from the conversation rather than trusting a receiver ID
from the client.

Every conversation operation checks that the current user is one of its two
participants. A user outside the conversation cannot read or send its messages.

The current frontend refreshes the open conversation every three seconds. This
is polling, not a WebSocket-based real-time connection.

## 9. Input validation

Authentication validation is located in `backend/src/utils/validation.js`.
Tutoring-request validation is located in
`backend/src/utils/requestValidation.js`.

Validation happens before database writes and produces user-readable messages.
Mongoose schema validation supplies a second layer of protection. The shared
error middleware also handles malformed JSON, Mongoose validation/cast errors,
duplicate database values, and unexpected failures.

Important field limits include:

| Field | Rule |
| --- | --- |
| User name | 2-80 characters |
| User email | Valid basic email shape, maximum 254 characters |
| Password | At least 8 characters, maximum 72 UTF-8 bytes |
| Major | Optional, maximum 100 characters |
| Request subject | Required, maximum 100 characters |
| Request topic | Required, maximum 150 characters |
| Request description | Required, maximum 2,000 characters |
| Message text | Required, maximum 2,000 characters |

## 10. Database design

MongoDB Atlas hosts the database, while Mongoose defines and validates document
shapes. The application uses references between collections rather than copying
complete user records into every document.

### `users`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | MongoDB identifier |
| `name` | String | Required |
| `email` | String | Required, lowercase, unique |
| `passwordHash` | String | Required and excluded from normal queries |
| `major` | String | Optional, defaults to an empty string |
| `createdAt` | Date | Added by Mongoose timestamps |
| `updatedAt` | Date | Added by Mongoose timestamps |

### `requests`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | MongoDB identifier |
| `studentId` | ObjectId reference | User who created the request |
| `tutorId` | ObjectId reference or null | User who accepted it |
| `subject` | String | Academic subject |
| `topic` | String | Specific help topic |
| `description` | String | Request details |
| `status` | String | Pending, accepted, completed, or cancelled |
| `requestedDate` | Date | Requested tutoring date |
| `requestedTime` | String | Requested time as entered |
| `createdAt` | Date | Added by Mongoose timestamps |
| `updatedAt` | Date | Added by Mongoose timestamps |

### `conversations`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | MongoDB identifier |
| `participantIds` | Two ObjectId references | Exactly two users |
| `lastMessage` | String | Preview of the newest message |
| `lastMessageTimestamp` | Date or null | Used to sort conversations |
| `createdAt` | Date | Added by Mongoose timestamps |
| `updatedAt` | Date | Added by Mongoose timestamps |

### `messages`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | MongoDB identifier |
| `conversationId` | ObjectId reference | Parent conversation |
| `senderId` | ObjectId reference | Sending user |
| `receiverId` | ObjectId reference | Receiving user |
| `text` | String | Message contents |
| `readAt` | Date or null | Null until marked read |
| `createdAt` | Date | Added by Mongoose timestamps |
| `updatedAt` | Date | Added by Mongoose timestamps |

### `sessions`

The `sessions` collection is managed by `connect-mongo`. It stores server-side
session data and expiration information. The browser holds only the session
identifier cookie, not the user's password or complete account data.

### Relationships

```text
User 1 ---- many TutoringRequests as student
User 1 ---- many TutoringRequests as tutor

User many ---- many Conversations through participantIds
Conversation 1 ---- many Messages
User 1 ---- many Messages as sender
User 1 ---- many Messages as receiver
```

Mongoose `populate()` is used when the API needs basic related-user information,
such as a student's name and major. Sensitive user fields are not populated.

## 11. Frontend behavior

`App.jsx` owns the signed-in user, selected screen, theme, logout state, and
selected conversation. When the page first loads, it calls `/api/auth/me` to
restore an existing session.

The main screens are:

- Home
- Login/signup
- Request help
- Browse tutoring requests
- Messages

The frontend currently switches screens with React state rather than a URL-based
router. `frontend/src/config/api.js` uses `http://localhost:5000` during Vite
development and the current website origin in the production build.

Frontend controls improve usability, but backend authorization is the actual
security boundary. A hidden or disabled frontend button does not replace server
permission checks.

## 12. Environment variables

Create `backend/.env` locally from `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/tutorbridge?retryWrites=true&w=majority
SESSION_SECRET=replace-with-a-long-random-secret
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No locally | Backend HTTP port; defaults to 5000 |
| `NODE_ENV` | Yes in production | Enables production security behavior |
| `FRONTEND_URL` | Optional on Render | Allowed frontend origin; useful for a custom domain |
| `RENDER_EXTERNAL_URL` | Supplied by Render | Default production frontend origin |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string and database name |
| `SESSION_SECRET` | Yes | Signs session cookies; production requires at least 32 characters |
| `SERVE_FRONTEND` | Production image | Enables Express static frontend serving |
| `VITE_API_URL` | Frontend build | Selects the API origin; empty in combined production |

Never commit `backend/.env`, MongoDB credentials, or production session secrets.
Render values belong in the Render environment-variable settings. The checked-in
`.env.example` intentionally contains no credentials.

## 13. Running the project

### First-time installation

Install Node.js and run:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Create `backend/.env`, fill in its values, and ensure the current computer's IP
address is permitted by the MongoDB Atlas Network Access list.

### Run frontend and backend together

From the repository root:

```bash
npm run dev
```

This uses `concurrently` to start both development processes.

### Run only the backend

```bash
npm run dev --prefix backend
```

The API is available at `http://localhost:5000`.

### Run only the frontend

```bash
npm run dev --prefix frontend
```

The Vite page is normally available at `http://localhost:5173`.

### Build and check the frontend

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

## 14. Local Docker workflow

Docker Desktop must be installed and running. From the repository root:

```bash
docker compose up --build
```

Local Compose starts two containers:

- frontend: Nginx on host port `5173`;
- backend: Express on host port `5000`.

The backend receives local secrets from `backend/.env`. The frontend image is
built with `VITE_API_URL=http://localhost:5000` because requests originate from
the user's browser, not from inside the frontend container.

Stop the containers with:

```bash
docker compose down
```

If port 5000 or 5173 is already in use, stop the existing application using
that port before starting Compose, or consistently change the host port and
frontend API URL.

## 15. Production image

`Dockerfile.render` is a multi-stage image:

1. The first Node stage installs frontend dependencies and runs the Vite build.
2. The second Node stage installs production backend dependencies.
3. The compiled frontend is copied into `/app/public`.
4. Express starts as the non-root `node` user.
5. Express serves both the static website and the API on port 10000.

The root `.dockerignore` keeps local environment files, `node_modules`, build
output, and Git data out of the production build context.

The separate `backend/Dockerfile` and `frontend/Dockerfile` are still used by
local Compose. They are not the production Render image.

## 16. Render deployment

`render.yaml` defines one Docker Web Service named `tutorbridge` using the free
plan. It points Render at `Dockerfile.render` and configures `/api/health` as the
health-check path.

Deployment flow:

1. Changes are committed and pushed to the connected GitHub repository.
2. Render reads `render.yaml` as a Blueprint.
3. Render builds `Dockerfile.render` from the repository root.
4. `MONGODB_URI` is supplied securely in Render.
5. Render generates `SESSION_SECRET`.
6. Atlas allows the Render service's outbound IP ranges.
7. Render starts the container and checks `/api/health`.
8. The website and API become available on the same HTTPS domain.

Render deployment details and a verification checklist are maintained in
`DEPLOYMENT.md`.

Free Render services may sleep after inactivity, so the first request after a
sleep period can be delayed. Permanent application data remains in MongoDB Atlas
rather than the container's temporary filesystem.

## 17. Security measures currently implemented

- Passwords are hashed using bcrypt and never returned by the API.
- Password hashes are excluded from ordinary Mongoose user queries.
- Sessions are regenerated after signup and login.
- Sessions are stored server-side in MongoDB.
- Cookies are HttpOnly and become Secure in production.
- Production requires HTTPS and a session secret of at least 32 characters.
- CORS allows only the configured frontend origin and supports credentials.
- Protected routes require a valid session.
- Controllers enforce request ownership and conversation membership.
- JSON request size is limited to 20 KB.
- Public user responses expose only approved fields.
- Database credentials and secrets are excluded from the Docker build and Git.

## 18. Automated testing plan

Automated tests are **planned but not currently installed or implemented**.
The proposed tools are:

- **Vitest** as the test runner, assertion library, setup system, and coverage
  tool;
- **Supertest** to send simulated HTTP requests directly to the Express app;
- a dedicated disposable MongoDB test database, separate from development and
  production data; and
- optionally **Playwright** later for browser-level end-to-end tests.

Vitest and Jest serve the same main role, so the project should choose one. The
current plan is Vitest plus Supertest, not Vitest and Jest together.

Recommended initial structure:

```text
backend/
`-- tests/
    |-- setup.js
    |-- unit/
    |   |-- validation.test.js
    |   `-- requestValidation.test.js
    `-- integration/
        |-- auth.test.js
        |-- requests.test.js
        `-- conversations.test.js
```

Highest-priority automated scenarios:

1. Signup succeeds and never returns `passwordHash`.
2. Duplicate signup returns `409`.
3. Correct login succeeds and incorrect login returns `401`.
4. A Supertest agent retains the session for `/api/auth/me`.
5. Logout invalidates that session.
6. Invalid tutoring-request fields return `400`.
7. A student cannot accept their own request.
8. Two tutors cannot both accept one request.
9. A user cannot edit or delete another user's request.
10. A non-participant cannot read or send conversation messages.

Tests should run locally and in GitHub Actions before changes are merged into
`main`. Test cleanup must never point at the development or production database.

## 19. Manual verification checklist

Until automated tests are added, verify these behaviors after important changes:

- `/api/health` returns `200` and `{"status":"ok"}`.
- A new account can sign up and appears in the correct Atlas database.
- Duplicate signup is rejected.
- Correct login works and incorrect login fails.
- Refreshing the page restores the session.
- Logout causes `/api/auth/me` to return `401`.
- A signed-in user can create and browse tutoring requests.
- A request owner cannot accept their own request.
- A second account can accept a pending request.
- Unauthorized accounts cannot edit another user's request.
- Conversation participants can exchange and read messages.
- Unrelated users cannot access private conversation data.
- Production browser requests contain no localhost URLs.
- Production cookies are Secure and HttpOnly.
- Refreshing a frontend view does not return an API error.

## 20. Known limitations and recommended next work

The following items are not yet complete and should be treated as future work:

- Add Vitest and Supertest automated tests.
- Add authentication rate limiting before opening public registration widely.
- Add a reliable unique conversation-pair key to prevent the small race window
  in simultaneous conversation creation.
- Make calendar-date validation stricter and define the tutoring-time timezone.
- Consider transactions or another consistency strategy when saving a message
  and updating its conversation preview.
- Add database backup, restore, logging, and monitoring procedures.
- Consider WebSockets if true real-time messaging becomes necessary.
- Consider URL-based frontend routing for bookmarkable application pages.
- Add pagination to tutoring-request lists as the dataset grows.
- Add browser-level end-to-end tests after the core API suite is stable.

## 21. Presentation summary

A concise technical explanation of the project is:

> TutorBridge uses a React frontend and an Express backend connected to MongoDB
> Atlas through Mongoose. Express exposes APIs for session authentication,
> tutoring requests, and one-to-one messaging. Passwords are bcrypt hashes, and
> authenticated sessions are stored in MongoDB using secure cookies. Locally,
> Docker Compose runs separate frontend and backend containers. For the free
> Render deployment, a multi-stage Docker build compiles React and places it in
> the Express image, allowing one Render service to serve both the website and
> the API. The next reliability step is a Vitest and Supertest suite covering
> validation, authentication, sessions, database behavior, and authorization.

## 22. Related documentation

- `README.md` - short overview and main commands
- `DEPLOYMENT.md` - Render deployment and production verification
- `backend/.env.example` - local environment-variable template
- Controller comments - endpoint-specific implementation notes
- Model files - authoritative Mongoose schema definitions

