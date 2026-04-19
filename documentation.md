# Spotify OAuth Documentation for Statify

## 1. Recommended OAuth flow

Statify should use Spotify's **Authorization Code Flow**.

### Why this is the correct flow

- Statify already has a backend, so the Spotify `client secret` can be stored securely server-side.
- The project needs access to **user-specific Spotify data**, not just public data.
- Spotify recommends the **Authorization Code Flow** for long-running server-backed web applications where the client secret can be safely stored.

### Why not use the other flows

- **Authorization Code with PKCE** is better for browser-only SPAs or mobile apps where the secret cannot be stored securely.
- **Client Credentials Flow** is not valid here because it does not grant access to user-specific resources like `/me`, top artists, or top tracks.

### Recommendation for Statify

Use a **backend-first OAuth implementation**:

- frontend starts the connection
- backend redirects to Spotify
- backend receives the callback
- backend exchanges `code` for tokens
- backend stores Spotify tokens
- backend makes Spotify API calls on behalf of the user

## 2. Required Spotify app configuration

From the Spotify Developer Dashboard, Statify will need:

- `Client ID`
- `Client Secret`
- `Redirect URI`

### Example local redirect URI

- `http://127.0.0.1:3000/spotify/callback`

### Example production redirect URI

- `https://api.statify.com/spotify/callback`

### Important redirect URI rules

- The redirect URI must exactly match the value allowlisted in the Spotify app settings.
- Use `HTTPS` in production.
- For local development, Spotify allows loopback addresses such as `127.0.0.1`.
- `localhost` is not allowed by Spotify for redirect URI registration.

## 3. Required scopes

### Minimal scopes for Statify

- `user-read-email`
- `user-read-private`
- `user-top-read`

### Why these are needed

- `user-read-email`
  - allows reading the Spotify account email from `/me`
- `user-read-private`
  - allows reading private user profile details from `/me`
- `user-top-read`
  - allows reading top artists and top tracks

### Optional scopes for later features

- `user-read-recently-played`
  - only if Statify later wants recent listening history
- `user-library-read`
  - only if Statify later wants saved tracks/albums analysis
- `user-read-currently-playing`
- `user-read-playback-state`
  - only if Statify later wants live playback information

### Recommended initial scope set

```text
user-read-email user-read-private user-top-read
```

## 4. Authentication sequence step by step

1. User clicks **Connect Spotify** in the frontend.
2. Frontend calls a backend endpoint such as `GET /spotify/login`.
3. Backend builds the Spotify authorization URL with:
   - `client_id`
   - `response_type=code`
   - `redirect_uri`
   - `scope`
   - `state`
4. Backend redirects the browser to Spotify Accounts `/authorize`.
5. User logs into Spotify and grants access.
6. Spotify redirects the browser back to Statify with:
   - `code`
   - `state`
7. Backend validates the `state` value.
8. Backend exchanges the authorization `code` for tokens at Spotify `/api/token`.
9. Spotify returns:
   - `access_token`
   - `refresh_token`
   - `expires_in`
   - `scope`
   - `token_type`
10. Backend stores Spotify tokens linked to the Statify user.
11. Backend uses the `access_token` to call Spotify Web API endpoints.
12. When the access token expires, backend uses the `refresh_token` to request a new access token.

## 5. Recommended backend endpoints

Suggested future backend routes:

- `GET /spotify/login`
  - starts the Spotify OAuth flow
- `GET /spotify/callback`
  - receives `code`, validates `state`, exchanges tokens
- `GET /spotify/profile`
  - returns Spotify profile data from `/me`
- `GET /spotify/top-artists`
  - returns data from `/me/top/artists`
- `GET /spotify/top-tracks`
  - returns data from `/me/top/tracks`

Possible later additions:

- `POST /spotify/disconnect`
- internal token refresh service/method
- database persistence for Spotify tokens associated with the local Statify user

## 6. Likely Spotify API endpoints to use later

### Current user profile

- `GET /me`

Used to retrieve:

- Spotify user id
- display name
- email
- account-related profile fields

### Top artists

- `GET /me/top/artists`

Useful query parameters:

- `time_range=short_term | medium_term | long_term`
- `limit`
- `offset`

### Top tracks

- `GET /me/top/tracks`

Useful query parameters:

- `time_range=short_term | medium_term | long_term`
- `limit`
- `offset`

### Possible later endpoint

- `GET /me/player/recently-played`
  - only if Statify later includes recent listening analytics

## 7. Security notes

### Why token exchange must happen in backend

- The backend can safely store the Spotify `client secret`.
- The frontend cannot safely protect secrets.
- Backend exchange prevents exposing sensitive app credentials in browser code.

### Why the client secret must never be exposed in frontend

- Any frontend code can be inspected by users.
- If exposed, anyone could impersonate the Statify Spotify app.

### Refresh token handling

- Spotify access tokens expire.
- Refresh tokens allow long-term access without forcing the user to reconnect often.
- Refresh tokens should be stored **server-side only**.
- Refresh tokens should never be sent to the frontend.
- Ideally, refresh tokens should be encrypted at rest in the database.

### Additional security recommendations

- Always validate OAuth `state` to reduce CSRF risk.
- Keep redirect URIs tightly controlled and exact.
- Store Spotify tokens associated with the currently authenticated local Statify user.
- Do not expose raw Spotify tokens to the browser unless there is a strong reason.

## 8. Final implementation recommendation for Statify

Statify should implement Spotify integration with this architecture:

- local Statify user logs into Statify first
- authenticated user clicks **Connect Spotify**
- backend starts Spotify Authorization Code Flow
- backend receives callback and exchanges code for tokens
- backend stores Spotify tokens linked to the Statify user
- backend exposes internal endpoints that fetch Spotify profile and analytics data

### Best first implementation scope

Implement in this order:

1. `GET /spotify/login`
2. `GET /spotify/callback`
3. token persistence in backend/database
4. `GET /spotify/profile`
5. `GET /spotify/top-artists`
6. `GET /spotify/top-tracks`

### Best initial scope set

```text
user-read-email user-read-private user-top-read
```

### Summary recommendation

For Statify, the safest and cleanest path is:

- use **Authorization Code Flow**
- keep OAuth logic in the backend
- keep Spotify secret and refresh-token logic out of the frontend
- start with profile + top artists + top tracks

## References

- Spotify Authorization overview:
  - https://developer.spotify.com/documentation/web-api/concepts/authorization
- Spotify Authorization Code Flow:
  - https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- Spotify Authorization Code with PKCE:
  - https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
- Spotify Redirect URI rules:
  - https://developer.spotify.com/documentation/web-api/concepts/redirect_uri
- Spotify app configuration:
  - https://developer.spotify.com/documentation/web-api/concepts/apps
- Spotify scopes:
  - https://developer.spotify.com/documentation/web-api/concepts/scopes
- Get current user's profile:
  - https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
- Get user's top artists and tracks:
  - https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
- Refreshing tokens:
  - https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

## Note

The optional scopes such as `user-read-recently-played` and `user-library-read` are recommendations for future analytics features. They are not required for the current Spotify OAuth MVP described above.
