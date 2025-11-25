# Fix for Render Migration Error

## Problem
The baseline migration failed on Render with error: "string contains embedded null"

## Solution

The Render database likely already has the other tables (User, Account, Session, etc.) from a previous deployment. We've created a new migration that only adds the `SkuSettings` table.

## Steps to Fix on Render

### Option 1: Resolve Failed Migration via Render Shell (Recommended)

1. Go to Render Dashboard → Your Web Service
2. Click on "Shell" tab
3. Run these commands:

```bash
# First, resolve the failed baseline migration
npx prisma migrate resolve --rolled-back 20251126015216_baseline

# Then apply the new migration
npx prisma migrate deploy
```

### Option 2: Manual SQL (If Option 1 doesn't work)

1. Connect to your Render database (via Render Dashboard → Database → Connect)
2. Run this SQL to create the table if it doesn't exist:

```sql
-- Check if table exists, create if not
CREATE TABLE IF NOT EXISTS "SkuSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nextSkuCounter" INTEGER NOT NULL DEFAULT 1,
    "skuPrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SkuSettings_pkey" PRIMARY KEY ("id")
);

-- Create index if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "SkuSettings_userId_key" ON "SkuSettings"("userId");

-- Add foreign key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'SkuSettings_userId_fkey'
    ) THEN
        ALTER TABLE "SkuSettings" ADD CONSTRAINT "SkuSettings_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Mark migration as applied in Prisma's migration table
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
    gen_random_uuid(),
    '',
    NOW(),
    '20251126015216_add_sku_settings',
    NULL,
    NULL,
    NOW(),
    1
) ON CONFLICT DO NOTHING;
```

3. Then redeploy your service

### Option 3: Reset Migration State (Nuclear Option - Use with Caution)

If the above doesn't work, you can reset the migration state:

1. In Render Shell, run:
```bash
# This will mark all migrations as applied (use only if tables already exist)
npx prisma migrate resolve --applied 20251126015216_add_sku_settings
```

## After Fix

Once the migration is resolved:
1. The `SkuSettings` table will exist in production
2. Your SKU settings functionality will work
3. Future deployments will work normally

## Prevention

For future migrations:
- Always test migrations locally first
- Use `npx prisma migrate dev` to create migrations
- Review migration SQL before committing
- Consider using `CREATE TABLE IF NOT EXISTS` for safety (though Prisma doesn't generate this by default)

