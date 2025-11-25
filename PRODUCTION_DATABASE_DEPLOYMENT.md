# Production Database Deployment Guide

## Overview
This guide explains how to deploy your database schema to production on Render.

## Current Setup
- **Platform**: Render.com
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Build Command**: Already includes `npx prisma migrate deploy`

## Step-by-Step Deployment

### Step 1: Create Production Migration (Local)

Since you've been using `db push` locally, you need to create a proper migration for production:

```bash
# Stop your dev server first
# Then run:
npx prisma migrate dev --name init_with_sku_settings
```

This will:
- Create a `prisma/migrations` directory
- Generate migration SQL files
- Apply migration to your local database
- Mark migration as applied

### Step 2: Verify Migration Files

After running the command, you should see:
```
prisma/
  migrations/
    YYYYMMDDHHMMSS_init_with_sku_settings/
      migration.sql
```

The migration.sql should include:
- All tables (User, Account, Session, EbayToken, VerificationToken)
- **SkuSettings table** (the new one we added)

### Step 3: Commit and Push to Git

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "Add database migration with SkuSettings table"
git push origin main
```

### Step 4: Deploy to Render

**Option A: Automatic (Recommended)**
- Render will automatically detect the new migration
- During build, `npx prisma migrate deploy` will run
- Migration will be applied to production database
- Your `SkuSettings` table will be created

**Option B: Manual (If needed)**
1. Go to Render Dashboard
2. Open your web service
3. Click "Shell" tab
4. Run: `npx prisma migrate deploy`

### Step 5: Verify Deployment

After deployment, verify the table exists:

1. Go to Render Dashboard → Your Database
2. Click "Connect" → "External Connection"
3. Connect with psql or pgAdmin
4. Run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'SkuSettings';
```

Should return: `SkuSettings`

## Your render.yaml Configuration

Your `render.yaml` already has the correct build command:
```yaml
buildCommand: npm ci && npx prisma migrate deploy && npm run build
```

This ensures:
- ✅ Dependencies are installed
- ✅ Migrations are applied to production database
- ✅ Prisma Client is generated (via postinstall script)
- ✅ Next.js app is built

## Important Notes

### Development vs Production

**Development (Local):**
- Use `npx prisma db push` for quick schema changes
- Use `npx prisma migrate dev` when ready to create migration

**Production:**
- **Always use migrations** (`prisma migrate deploy`)
- Never use `db push` in production
- Migrations are version-controlled and safe

### Migration Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration locally:**
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```
3. **Test locally** - migration is applied automatically
4. **Commit and push** migration files
5. **Deploy** - Render applies migration automatically

### Adding New Tables/Fields

When you add new models or fields:

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_feature_name`
3. Test locally
4. Commit and push
5. Deploy to production

## Troubleshooting

### Migration Fails in Production

**Error**: "Migration failed"
- Check Render build logs
- Verify DATABASE_URL is correct
- Ensure database is accessible
- Check migration SQL for syntax errors

### Table Already Exists Error

**Error**: "Table already exists"
- This means migration was partially applied
- Mark migration as applied manually:
  ```bash
  npx prisma migrate resolve --applied migration_name
  ```

### Missing SkuSettings Table

If `SkuSettings` table is missing in production:

1. Create migration locally:
   ```bash
   npx prisma migrate dev --name add_sku_settings
   ```
2. Commit and push
3. Deploy to Render
4. Migration will create the table

## Environment Variables

Ensure these are set in Render:

- ✅ `DATABASE_URL` - Auto-connected from database
- ✅ `NODE_ENV=production`
- ✅ `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

## Best Practices

1. **Always create migrations** for schema changes
2. **Test migrations locally** before deploying
3. **Review migration SQL** before committing
4. **Never edit migration files** after they're applied
5. **Use descriptive migration names**
6. **Keep migrations in version control**

## Quick Reference

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production (Render does this automatically)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (development only - DESTRUCTIVE)
npx prisma migrate reset
```

## Next Steps

1. ✅ Create initial migration with SkuSettings
2. ✅ Commit and push to Git
3. ✅ Deploy to Render
4. ✅ Verify table exists in production
5. ✅ Test SKU settings functionality

