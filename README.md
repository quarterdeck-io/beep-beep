# Beep Beep - eBay Product Search

A Next.js application that allows users to search eBay products by UPC code after authenticating with their eBay account.

## Features

- 🔐 **User Authentication**: Email/password signup and login
- 🔗 **eBay Integration**: Connect your eBay account via OAuth 2.0
- 🔍 **UPC Search**: Search for products on eBay using UPC codes
- 📱 **Responsive Design**: Beautiful UI with Tailwind CSS
- 🌓 **Dark Mode**: Automatic dark mode support
- 🚀 **Production Ready**: Deployable to Render with PostgreSQL

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Render

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- eBay Developer Account (for API credentials - optional for initial setup)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd beep-beep
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install and Set Up PostgreSQL

#### **macOS Setup**

**Option A: Using Homebrew (Recommended)**

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@16
   ```

2. **Start PostgreSQL:**
   ```bash
   # Start PostgreSQL service
   export LC_ALL=en_US.UTF-8
   /usr/local/opt/postgresql@16/bin/pg_ctl -D /usr/local/var/postgresql@16 -l /usr/local/var/log/postgresql@16.log start
   
   # Or use Homebrew services (if Homebrew is working)
   brew services start postgresql@16
   ```

3. **Create PostgreSQL User:**
   ```bash
   # Connect as postgres user and create your user
   /usr/local/opt/postgresql@16/bin/psql postgres -U postgres -c "CREATE USER $(whoami) WITH SUPERUSER CREATEDB CREATEROLE LOGIN;"
   ```

4. **Create Database:**
   ```bash
   createdb beepbeep
   ```

**Option B: Using Postgres.app (Easier for beginners)**

1. Download and install [Postgres.app](https://postgresapp.com/)
2. Open Postgres.app and click "Initialize" to create a new server
3. Click "Start" to start the server
4. The default user is your macOS username, no password needed
5. Create database:
   ```bash
   createdb beepbeep
   ```

#### **Windows Setup**

**Option A: Using PostgreSQL Installer (Recommended)**

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the PostgreSQL installer (latest version)
   - Run the installer

2. **During Installation:**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set a password for the `postgres` superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default locale

3. **After Installation:**
   - PostgreSQL service should start automatically
   - If not, start it from Services (search "Services" in Windows, find "postgresql-x64-16")

4. **Create Database:**
   - Open Command Prompt or PowerShell
   - Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin`)
   - Or add PostgreSQL to your PATH
   - Create database:
     ```bash
     createdb -U postgres beepbeep
     ```
   - Enter the password you set during installation

**Option B: Using Chocolatey**

```bash
# Install Chocolatey if you don't have it
# Then install PostgreSQL
choco install postgresql16

# Start PostgreSQL service
net start postgresql-x64-16

# Create database
createdb -U postgres beepbeep
```

**Option C: Using WSL (Windows Subsystem for Linux)**

If you have WSL installed, you can follow the Linux instructions:

```bash
# In WSL terminal
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createdb beepbeep
sudo -u postgres createuser -s $USER
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

**macOS/Linux:**
```env
# Database - Replace 'yourusername' with your actual username
DATABASE_URL="postgresql://yourusername@localhost:5432/beepbeep?schema=public"

# NextAuth - Generate a random secret
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# eBay API (Required for eBay integration)
# ⚠️ eBay uses RuName (NOT a regular URL) - See EBAY_OAUTH_SETUP.md for details
# EBAY_SANDBOX="true"
# EBAY_CLIENT_ID="your-ebay-client-id"
# EBAY_CLIENT_SECRET="your-ebay-client-secret"
# EBAY_RUNAME="your-ebay-runame-from-developer-portal"
# EBAY_SCOPE="https://api.ebay.com/oauth/api_scope"
```

**Windows (if you set a password):**
```env
# Database - Replace 'postgres' and 'yourpassword' with your credentials
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/beepbeep?schema=public"

# NextAuth - Generate a random secret (use PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# eBay API (Required for eBay integration)
# ⚠️ eBay uses RuName (NOT a regular URL) - See EBAY_OAUTH_SETUP.md for details
# EBAY_SANDBOX="true"
# EBAY_CLIENT_ID="your-ebay-client-id"
# EBAY_CLIENT_SECRET="your-ebay-client-secret"
# EBAY_RUNAME="your-ebay-runame-from-developer-portal"
# EBAY_SCOPE="https://api.ebay.com/oauth/api_scope"
```

Also create a `.env` file for Prisma (same DATABASE_URL as above):
```env
DATABASE_URL="postgresql://yourusername@localhost:5432/beepbeep?schema=public"
```

**Generate NextAuth Secret:**

- **macOS/Linux:**
  ```bash
  openssl rand -base64 32
  ```

- **Windows (PowerShell):**
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  ```

**⚠️ Important: eBay OAuth Setup**

eBay uses a **RuName (Redirect URL name)** instead of regular callback URLs. This is different from most OAuth providers!

📖 **See [EBAY_OAUTH_SETUP.md](./EBAY_OAUTH_SETUP.md) for detailed instructions** on:
- How to get your RuName from eBay Developer Portal
- Sandbox vs Production configuration
- OAuth scopes and permissions
- Troubleshooting common issues

### 5. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init
```

**Troubleshooting Database Connection:**

- **macOS:** Make sure PostgreSQL is running: `pg_isready`
- **Windows:** Check if PostgreSQL service is running in Services
- **Connection refused:** Verify PostgreSQL is listening on port 5432
- **Authentication failed:** Check your username and password in DATABASE_URL

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. View Your Database (Optional but Recommended)

**Prisma Studio** (Visual Database Browser):
```bash
npx prisma studio
```
Opens at http://localhost:5555 - Great for viewing and editing data!

**Alternative Tools:**
- **pgAdmin** (Windows/macOS): https://www.pgadmin.org/
- **DBeaver** (Universal): https://dbeaver.io/
- **TablePlus** (Beautiful GUI): https://tableplus.com/

## eBay API Setup

To enable eBay integration:

1. **Create an eBay Developer Account**
   - Go to https://developer.ebay.com
   - Sign up or log in

2. **Create an Application**
   - Navigate to "My Account" → "Application Keys"
   - Create a new application
   - Get your Client ID and Client Secret

3. **Configure OAuth**
   - Add your redirect URI: `http://localhost:3000/api/ebay/callback` (for development)
   - For production: `https://your-domain.com/api/ebay/callback`

4. **Add Credentials to Environment Variables**
   - Update your `.env.local` with the eBay credentials

5. **Implement OAuth Flow**
   - The placeholder OAuth flow is in `app/ebay-connect/page.tsx`
   - Complete the implementation with your eBay API credentials

## Project Structure

```
beep-beep/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/
│   │   ├── auth/           # NextAuth API routes
│   │   ├── signup/         # Signup API route
│   │   └── ebay/           # eBay API routes
│   ├── dashboard/          # User dashboard
│   ├── ebay-connect/       # eBay connection page
│   └── product-search/     # Product search page
├── components/
│   ├── Navigation.tsx      # Navigation bar
│   └── SessionProvider.tsx # Auth session provider
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
├── types/
│   └── next-auth.d.ts     # NextAuth type definitions
└── middleware.ts          # Route protection middleware
```

## Database Schema

The application uses the following models:

- **User**: User accounts with email/password
- **Session**: NextAuth session management
- **Account**: Social login accounts (future)
- **EbayToken**: eBay OAuth tokens for each user
- **VerificationToken**: Email verification (future)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create new migration
- `npx prisma generate` - Generate Prisma Client

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Render.

Quick deploy with Render:

1. Push your code to GitHub
2. Connect to Render
3. Render will auto-detect `render.yaml`
4. Add environment variables
5. Deploy!

## Future Enhancements

- [ ] Complete eBay OAuth 2.0 integration
- [ ] Add social login (Google, GitHub)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Product search history
- [ ] Favorite products
- [ ] Advanced search filters
- [ ] Product comparison
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Database with [Prisma](https://www.prisma.io/)
