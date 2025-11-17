# Deployment Guide for Render

This guide will help you deploy the Beep Beep application to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your application code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. eBay Developer credentials (Client ID and Client Secret)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create a new Blueprint in Render**
   - Go to https://dashboard.render.com/blueprints
   - Click "New Blueprint Instance"
   - Connect your Git repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to create all services

3. **Add Environment Variables**
   - After services are created, go to your web service settings
   - Add the following environment variables:
     - `EBAY_CLIENT_ID`: Your eBay Client ID
     - `EBAY_CLIENT_SECRET`: Your eBay Client Secret
     - `EBAY_REDIRECT_URI`: `https://your-app-name.onrender.com/api/ebay/callback`
   - These should be added manually as they contain sensitive information

4. **Run Database Migrations**
   - Once deployed, open the shell for your web service
   - Run: `npx prisma migrate deploy`

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `beep-beep-db`
   - Database: `beepbeep`
   - User: `beepbeep`
   - Region: Choose closest to your users
   - Plan: Free (or paid for production)
4. Click "Create Database"
5. Copy the "Internal Database URL" (for connecting from your web service)

#### Step 2: Create Web Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - Name: `beep-beep`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: Leave empty
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or paid for production)

#### Step 3: Add Environment Variables

Add these environment variables in your web service:

```
NODE_ENV=production
DATABASE_URL=[Your Internal Database URL from Step 1]
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app-name.onrender.com
EBAY_CLIENT_ID=[Your eBay Client ID]
EBAY_CLIENT_SECRET=[Your eBay Client Secret]
EBAY_REDIRECT_URI=https://your-app-name.onrender.com/api/ebay/callback
```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Once deployed, open the shell and run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Post-Deployment

### 1. Update eBay Redirect URI

Go to your eBay Developer account and update the OAuth Redirect URI to:
```
https://your-app-name.onrender.com/api/ebay/callback
```

### 2. Test Your Application

1. Visit your deployed URL
2. Create an account
3. Log in
4. Try connecting your eBay account
5. Search for a product using a UPC code

### 3. Monitor Logs

- Go to your web service in Render Dashboard
- Click "Logs" tab to see real-time logs
- Monitor for any errors or issues

## Database Migrations

When you make changes to your Prisma schema:

1. Locally, create a migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. Push changes to Git:
   ```bash
   git add .
   git commit -m "Add database migration"
   git push
   ```

3. Render will automatically deploy
4. Run the migration in Render shell:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

### Database Connection Issues

- Ensure `DATABASE_URL` is using the "Internal Database URL"
- Check that your database and web service are in the same region
- Verify the connection string format

### Build Failures

- Check build logs in Render Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Errors

- Check runtime logs in Render Dashboard
- Ensure all environment variables are set correctly
- Verify database migrations are applied

## Free Tier Limitations

Render's free tier includes:

- Web Service: Automatically spins down after 15 minutes of inactivity
- PostgreSQL: 1GB storage, 1 month data retention
- 750 hours/month free (sufficient for one service)

For production use, consider upgrading to a paid plan.

## Scaling

To handle more traffic:

1. Upgrade to a paid plan
2. Enable auto-scaling in Render Dashboard
3. Consider adding Redis for session storage
4. Implement connection pooling for database (Prisma Accelerate)

## Support

- Render Documentation: https://render.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- Next.js Documentation: https://nextjs.org/docs

