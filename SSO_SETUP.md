# SSO Setup Instructions

## Prerequisites

1. Make sure you have the Decode SSO server running on `localhost:3000`
2. Register your "dehive" application with the SSO server
3. Obtain your app secret from the SSO server

## Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:
   ```env
   DECODE_BASE_URL=http://localhost:3000
   DEHIVE_APP_ID=dehive
   DEHIVE_APP_SECRET=your_actual_app_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   NODE_ENV=development
   ```

## How SSO Works

1. **Login Flow**:

   - User clicks "Login with SSO" button
   - App calls `/api/auth/create-sso` to generate authorization URL
   - User is redirected to Decode SSO server
   - User authenticates on SSO server
   - SSO server redirects back to `/api/auth/callback`
   - Callback exchanges code for tokens and sets cookies
   - User is redirected to `/dashboard`

2. **Logout Flow**:
   - User clicks "Logout" button
   - App calls `/api/auth/logout` to clear cookies
   - User is redirected to home page

## API Endpoints

- `GET /api/auth/create-sso` - Initiate SSO login
- `GET /api/auth/callback` - Handle SSO callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/logout` - Logout user (redirect)

## Pages

- `/` - Home page with login button
- `/auth/login` - Alternative login page
- `/auth/error` - SSO error page
- `/dashboard` - Protected dashboard (requires authentication)

## Security Features

- State and nonce validation
- HTTP-only cookies for tokens
- Secure cookies in production
- CSRF protection through SameSite cookies
- Automatic token cleanup on logout

## Troubleshooting

1. **"Cannot start SSO" error**: Check that `DECODE_BASE_URL` and `DEHIVE_APP_ID` are correct
2. **"State mismatch" error**: Clear cookies and try again
3. **"Failed to exchange code" error**: Check that `DEHIVE_APP_SECRET` is correct
4. **Redirect loops**: Ensure callback URL is registered with SSO server

## Running the Application

```bash
npm run dev
```

Then visit `http://localhost:3000` to test the SSO flow.
