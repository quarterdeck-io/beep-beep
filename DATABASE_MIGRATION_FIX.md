# Database Migration Fix

## Issue
After successful deployment, the signup endpoint was returning a 500 Internal Server Error.

**Error:**
```
POST https://beep-beep-erxw.onrender.com/api/signup
Status: 500 Internal Server Error
```

## Root Cause
The database migrations were not being applied during the build process, resulting in missing tables in the PostgreSQL database. When the signup API tried to create a user, it failed because the `User` table didn't exist.

## Solution
Added `npx prisma migrate deploy` to the build command in `render.yaml`.

### Before:
```yaml
buildCommand: npm ci && npm run build
```

### After:
```yaml
buildCommand: npm ci && npx prisma migrate deploy && npm run build
```

## What This Does

1. **`npm ci`** - Clean install of dependencies
2. **`npx prisma migrate deploy`** - Applies all pending migrations to the production database
3. **`npm run build`** - Builds the Next.js application

The `prisma migrate deploy` command:
- Runs all migrations that haven't been applied yet
- Is safe to run multiple times (idempotent)
- Uses the `DATABASE_URL` environment variable from Render
- Creates all necessary tables (`User`, `Account`, `Session`, `VerificationToken`, `EbayToken`)

## Migration Applied

The initial migration (`20251117210606_init`) creates:
- ✅ User table (for authentication)
- ✅ Account table (for OAuth providers)
- ✅ Session table (for session management)
- ✅ VerificationToken table (for email verification)
- ✅ EbayToken table (for eBay OAuth tokens)

## Expected Result

After redeployment:
- ✅ Database schema is created/updated automatically
- ✅ Signup endpoint should work
- ✅ Users can create accounts
- ✅ Login functionality should work
- ✅ eBay token storage ready

## Testing

Once the new deployment completes, test:

1. **Signup:** Create a new account
   ```
   POST /api/signup
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```
   Expected: 201 Created

2. **Login:** Log in with the new account
   Expected: Redirect to dashboard

3. **eBay Connect:** Connect eBay account
   Expected: OAuth flow works

## Commit
`2ce2766` - Add database migration to build command

## Status
✅ Fix deployed - waiting for Render to rebuild with migrations

