# Safe Deployment to Render - EbayBusinessPolicies Table

## ✅ What We Created

A **SAFE migration** that:
- ✅ Only adds the `EbayBusinessPolicies` table
- ✅ Does NOT touch existing tables (User, EbayToken, SkuSettings, etc.)
- ✅ Does NOT delete any data
- ✅ Uses `IF NOT EXISTS` to prevent errors if run multiple times
- ✅ Safely adds foreign keys only if User table exists

## 📁 Migration File

Location: `prisma/migrations/20251202_add_ebay_business_policies/migration.sql`

## 🚀 How to Deploy to Render

### Method 1: Automatic Migration (Recommended)

Render will automatically run migrations when you deploy.

**Steps:**

1. **Commit the migration:**
```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: Add EbayBusinessPolicies table migration"
git push origin main
```

2. **Render will automatically:**
   - Detect the new migration
   - Run `prisma migrate deploy`
   - Apply only the new migration
   - Keep all existing data safe

3. **Verify in Render Dashboard:**
   - Go to your Render service
   - Check the deployment logs
   - Look for: "Applied migration 20251202_add_ebay_business_policies"

### Method 2: Manual Migration (If Needed)

If automatic migration fails, run manually:

**In Render Shell:**
```bash
npx prisma migrate deploy
```

This will:
- Only apply pending migrations
- Skip already-applied migrations
- Keep existing data intact

## ⚠️ What's Protected

Your existing data is **SAFE**:
- ✅ All users remain
- ✅ All eBay tokens remain
- ✅ All SKU settings remain
- ✅ All sessions remain
- ✅ Only adds new empty `EbayBusinessPolicies` table

## 🔍 Verify After Deployment

### Check 1: Table Exists
In Render shell or Prisma Studio:
```sql
SELECT * FROM "EbayBusinessPolicies";
```

Should return an empty table (no error).

### Check 2: Existing Data Intact
```sql
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "EbayToken";
SELECT COUNT(*) FROM "SkuSettings";
```

All counts should match what you had before!

### Check 3: Test the Feature
1. Go to your Render URL
2. Login
3. Go to Settings
4. Load eBay policies
5. Save policies
6. Check database - should see saved policies

## 📋 Migration History

After deployment, Render will have:

```
_prisma_migrations table:
- 20251126015216_baseline (already applied)
- 20251126015216_add_sku_settings (already applied)
- 20251202_add_ebay_business_policies (NEW - will be applied)
```

## 🔒 Safety Features

The migration uses:

1. **CREATE TABLE IF NOT EXISTS** - Won't error if table already exists
2. **Conditional Foreign Keys** - Only adds if User table exists
3. **No DROP statements** - Never deletes anything
4. **No ALTER on existing tables** - Doesn't modify User, EbayToken, etc.

## 🚨 If Something Goes Wrong

### Issue: Migration Already Applied Manually

If you already ran this migration manually on Render:

```sql
-- In Render shell
INSERT INTO "_prisma_migrations" 
("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES 
(gen_random_uuid(), '', NOW(), '20251202_add_ebay_business_policies', NULL, NULL, NOW(), 1);
```

This marks it as applied without running it again.

### Issue: Table Already Exists

No problem! The migration uses `IF NOT EXISTS`, so it will skip gracefully.

### Issue: Need to Rollback

To remove just the new table (keeps all other data):

```sql
DROP TABLE IF EXISTS "EbayBusinessPolicies";
```

Then remove from migrations table:
```sql
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251202_add_ebay_business_policies';
```

## 📊 What Render Sees

**Before Migration:**
```
Tables:
- User
- Account
- Session
- VerificationToken
- EbayToken
- SkuSettings
- _prisma_migrations
```

**After Migration:**
```
Tables:
- User ✓ (unchanged)
- Account ✓ (unchanged)
- Session ✓ (unchanged)
- VerificationToken ✓ (unchanged)
- EbayToken ✓ (unchanged)
- SkuSettings ✓ (unchanged)
- EbayBusinessPolicies ← NEW! (empty)
- _prisma_migrations ✓ (new entry added)
```

## ✅ Pre-Deployment Checklist

- [ ] Migration file exists: `prisma/migrations/20251202_add_ebay_business_policies/migration.sql`
- [ ] Migration uses `IF NOT EXISTS`
- [ ] No DROP or ALTER statements for existing tables
- [ ] Prisma schema includes EbayBusinessPolicies model
- [ ] Local database has the table (test it works)
- [ ] Code pushed to main branch
- [ ] Render environment variables updated (EBAY_SCOPE, EBAY_MARKETPLACE_ID)

## 🎯 Deploy Commands

### Local Testing (Before Deploy)
```bash
# Test the migration locally
npx prisma migrate deploy

# Verify it works
npx prisma studio
# Check EbayBusinessPolicies table exists
```

### Deploy to Render
```bash
git add .
git commit -m "feat: Add eBay Business Policies table"
git push origin main
```

### After Render Deployment
Watch the logs for:
```
✓ Applied migration 20251202_add_ebay_business_policies
✓ Database schema is up to date!
```

## 🎉 Success Indicators

After successful deployment:
1. ✅ Render deployment shows "Live"
2. ✅ No database errors in logs
3. ✅ Existing users can still login
4. ✅ Settings page loads
5. ✅ Can save eBay policies
6. ✅ Prisma Studio shows EbayBusinessPolicies table

## 📞 Need Help?

If deployment fails, share:
1. Render deployment logs
2. Error messages
3. Database migration status: `SELECT * FROM "_prisma_migrations";`

---

**Ready to deploy safely!** This migration won't touch your existing data. 🚀

