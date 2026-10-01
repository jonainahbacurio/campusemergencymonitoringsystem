# ALERTO — Emergency Monitoring System

A Next.js website for Vercel with Supabase email/password responder authentication and PostgreSQL storage.

## Included

- Responder sign-in; accepted incidents store the account's full name (email fallback).
- Awaiting Response, Responding Now, Resolved, Active Emergencies.
- Repeating audio and blinking popup until an incident is accepted.
- API ingestion, Respond, Resolve, emergency log, individual deletion and clear resolved history.
- Database schema and environment template. No ChatGPT account required.

## 1. Create the database and accounts

1. Create a project at https://supabase.com/dashboard .
2. Open SQL Editor, paste `database/setup.sql`, and run it.
3. Find the project URL and keys in the project settings/API keys. Use the anon or publishable key for SUPABASE_ANON_KEY and the server-only service_role key for SUPABASE_SERVICE_ROLE_KEY.
4. In Authentication settings, disable public sign-ups. This is an administrator-managed responder system: only approved responder accounts should exist.
5. In Authentication → Users, add a user with an email and password and confirm the account. Set user metadata to `{"full_name":"Responder Name"}` using the user editor or the script below. If full_name is absent, the email is recorded.
6. To create a confirmed account with its name using the included script, first configure `.env.local`, then run:

   `node --env-file=.env.local scripts/create-responder.mjs`

   The script prompts for email, name, and password. Do not enter credentials in chat or commit them.

## 2. Run on your computer

Install Node.js 22 or newer. Extract the ZIP and open a terminal in the folder containing package.json.

```sh
npm install
```

Copy `.env.example` to `.env.local` and replace all placeholders. Generate a random API secret:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set that value as EMERGENCY_API_KEY, then run:

```sh
npm run dev
```

Open http://localhost:3000 . Sign in and click Enter dashboard to enable sound.

## 3. Deploy to Vercel

### GitHub import

1. Create a private GitHub repository. Upload the project files with package.json at the repository root. Include .env.example, but never .env.local or real keys. Exclude node_modules and .next.
2. Sign in at https://vercel.com/new and import the repository.
3. Framework preset: Next.js. Root directory: the folder containing package.json. Keep the default build/output settings.
4. Add these four environment variables for Production (and Preview if needed):

| Variable | Value |
| --- | --- |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_ANON_KEY | anon / publishable key |
| SUPABASE_SERVICE_ROLE_KEY | server-only service_role key |
| EMERGENCY_API_KEY | your generated random secret |

5. Click Deploy. Open the resulting URL and sign in with your responder account.
6. After changing environment variables, redeploy so the deployment uses the new values.
7. If Vercel Deployment Protection is enabled, external devices may be blocked before the API is reached. Configure the production deployment appropriately; application APIs still require X-API-Key or responder sign-in.

### Alternative: Vercel CLI

```sh
npm install -g vercel
vercel login
vercel
```

Add the four variables in the Vercel project settings, then run `vercel --prod`.

## 4. Test the emergency API

POST `https://YOUR-SITE.vercel.app/api/emergencies`

Headers:

```text
Content-Type: application/json
X-API-Key: YOUR_EMERGENCY_API_KEY
```

Body:

```json
{
  "category": "fire",
  "description": "Smoke detected in the computer laboratory",
  "location": "Computer Laboratory 1",
  "severity": "critical"
}
```

Use Postman or PowerShell. Example PowerShell:

```powershell
$headers = @{ "X-API-Key" = "YOUR_EMERGENCY_API_KEY" }
$body = @{ category="fire"; description="Smoke detected"; location="Computer Laboratory 1"; severity="critical" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://YOUR-SITE.vercel.app/api/emergencies" -Method Post -Headers $headers -ContentType "application/json" -Body $body
```

Expected: HTTP 201 with an incident ID. Open the dashboard before posting. Within approximately 2.5 seconds the popup appears. Respond stops that incident's alert and moves it to Active Emergencies. If more incidents are awaiting, the next popup stays active. Only the assigned responder can resolve their incident. Resolved records can be deleted after confirmation.

Categories are free text; severity must be low, moderate, high, or critical. No title field is required. Keep the API secret in your device configuration, never public browser code.

## Operation and limits

- Keep the page open and the device awake. Browser background throttling may delay alerts. This is polling, not push notification when the browser is closed.
- The sign-in session lasts for the Supabase access-token lifetime; this version asks responders to sign in again when it expires. It does not automatically refresh sessions.
- Sound requires entering the dashboard and a browser that permits Web Audio. Sound can be toggled; visual alert remains until response. Reduced-motion preferences disable blinking animation.
- Awaiting = unaccepted; Responding Now and Active Emergencies both count accepted, unresolved incidents.
- History deletion affects resolved records only and is permanent. All approved responders can view the shared log and delete resolved history.
- Stored records remain in Supabase across deployments. Do not use Vercel's local filesystem as a database.
- Before relying on this operationally, run an end-to-end test with your real accounts, database, and emergency source. This package was build-checked without access to your services.

## Files

`app/monitor.tsx`: UI and notifications; `app/globals.css`: styles; `app/api/`: login and emergency endpoints; `lib/backend.ts`: server-only authentication/database calls; `database/setup.sql`: schema; `scripts/create-responder.mjs`: account setup.

References: https://vercel.com/docs/deployments , https://vercel.com/docs/environment-variables , https://supabase.com/docs/guides/auth/passwords , https://supabase.com/docs/guides/api .
