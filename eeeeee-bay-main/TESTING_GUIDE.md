# Local Testing Guide

This guide will help you test your local setup of the eBay Listing Assistant application.

## 📋 Prerequisites Check

Before testing, verify you have everything installed:

### 1. Check Node.js Version

```bash
node --version
```

**Required:** Node.js 18 or higher

### 2. Check npm Version

```bash
npm --version
```

### 3. Verify Dependencies Are Installed

```bash
npm install
```

This will install all required dependencies. If you see errors, check your Node.js version.

---

## 🔧 Environment Setup

### 1. Create `.env` File

Create a `.env` file in the project root directory with your eBay API credentials:

```env
# eBay API Configuration
VITE_EBAY_APP_ID=your_app_id_here
VITE_EBAY_CLIENT_ID=your_app_id_here
VITE_EBAY_CLIENT_SECRET=your_cert_id_here
VITE_EBAY_DEV_ID=your_dev_id_here
VITE_EBAY_REDIRECT_URI=https://localhost:3000/callback

# OAuth Configuration
VITE_EBAY_SCOPE=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account

# Environment Settings
VITE_EBAY_SANDBOX=true  # Set to true for testing, false for production
```

**Note:** For local testing, use `VITE_EBAY_SANDBOX=true` to avoid affecting real eBay listings.

### 2. Verify Environment Variables

You can create a simple script to check if your environment variables are loaded:

```bash
# On Windows PowerShell
$env:VITE_EBAY_CLIENT_ID

# On Windows CMD
echo %VITE_EBAY_CLIENT_ID%

# On Mac/Linux
echo $VITE_EBAY_CLIENT_ID
```

---

## ✅ Quick Verification Tests

### 1. Type Checking

Check for TypeScript errors:

```bash
npm run typecheck
```

**Expected:** No errors. If you see errors, fix them before proceeding.

### 2. Linting

Check code quality:

```bash
npm run lint
```

**Expected:** No linting errors. To auto-fix issues:

```bash
npm run lint:fix
```

### 3. Run Unit Tests

Run the test suite:

```bash
npm run test
```

**Expected:** All tests should pass. Current tests include:
- Barcode validation (UPC-12, EAN-13, EAN-8)
- Component tests (if any)

### 4. Watch Mode for Tests

Run tests in watch mode (re-runs on file changes):

```bash
npm run test:watch
```

**Note:** The `test:watch` script may need to be added to `package.json`:

```json
"test:watch": "vitest watch"
```

---

## 🚀 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

**What happens:**
1. Electron app window opens automatically
2. Hot module replacement enabled (changes reflect immediately)
3. DevTools available (press F12)
4. Logs written to `eeeeee-bay.log` in project root

### Production Preview

Test the production build locally:

```bash
npm run build
npm run start
```

---

## 🧪 Manual Testing Checklist

### 1. Application Startup

- [ ] Application window opens
- [ ] No console errors in DevTools (F12)
- [ ] Application shows login screen if not authenticated
- [ ] Log file is created (`eeeeee-bay.log`)

### 2. OAuth Authentication

- [ ] Click "Login" button
- [ ] OAuth popup window opens
- [ ] Can complete eBay login flow
- [ ] Redirects back to application
- [ ] Access token is received and stored
- [ ] Application shows authenticated state

**Troubleshooting:**
- If popup doesn't open: Check browser console for errors
- If redirect fails: Verify `VITE_EBAY_REDIRECT_URI` matches eBay app settings
- If token exchange fails: Check client secret is correct

### 3. Policy Setup

- [ ] After login, policy setup screen appears (if not configured)
- [ ] Can fetch fulfillment policies
- [ ] Can fetch payment policies
- [ ] Can fetch return policies
- [ ] Can select and save policies
- [ ] Can set initial SKU number
- [ ] Settings are saved and persist

### 4. UPC Search

- [ ] Can enter UPC/EAN barcode
- [ ] Valid barcodes are accepted (UPC-12, EAN-13, EAN-8)
- [ ] Invalid barcodes show error message
- [ ] Search button triggers API call
- [ ] Loading state is shown during search
- [ ] Product data is displayed if found
- [ ] Error message shown if product not found

**Test Barcodes:**
- Valid UPC-12: `012345678905`
- Valid EAN-13: `1234567890128`
- Valid EAN-8: `12345670`
- Invalid: `123` (too short)

### 5. Duplicate Detection

- [ ] Duplicate check runs after product search
- [ ] Warning shown if duplicate found
- [ ] Can proceed or cancel when duplicate detected

### 6. Listing Preview

- [ ] Product details displayed correctly
- [ ] Can edit title, price, description
- [ ] Can change category
- [ ] Can modify SKU
- [ ] Images display correctly
- [ ] All fields are editable

### 7. Listing Creation

- [ ] "Confirm" button creates listing
- [ ] Loading state shown during creation
- [ ] Success message displayed
- [ ] SKU is incremented
- [ ] Can start new search after publishing
- [ ] Error handling works for API failures

### 8. Settings Management

- [ ] Can access settings from main screen
- [ ] Can modify policies
- [ ] Can change initial SKU
- [ ] Changes are saved
- [ ] Settings persist after app restart

### 9. Logout

- [ ] Logout button works
- [ ] Tokens are cleared
- [ ] Returns to login screen
- [ ] Cache is cleared

---

## 🔍 Debugging Tips

### 1. Enable DevTools

Press `F12` in the Electron window to open DevTools.

### 2. Check Logs

View the application log file:

```bash
# Windows PowerShell
Get-Content eeeeee-bay.log -Tail 50

# Windows CMD
type eeeeee-bay.log

# Mac/Linux
tail -f eeeeee-bay.log
```

### 3. Check Console Output

The main process logs to console. Check your terminal where you ran `npm run dev`.

### 4. Network Requests

In DevTools (F12):
- Go to **Network** tab
- Filter by "XHR" or "Fetch"
- Check API request/response details
- Look for 401 (unauthorized) or 403 (forbidden) errors

### 5. Check Environment Variables

Add temporary logging to verify env vars are loaded:

```typescript
// In src/renderer/src/api.ts (temporary)
console.log('Client ID:', import.meta.env.VITE_EBAY_CLIENT_ID ? 'SET' : 'MISSING')
console.log('Sandbox:', import.meta.env.VITE_EBAY_SANDBOX)
```

---

## 🐛 Common Issues & Solutions

### Issue: "OAuth window closed" error

**Solution:**
- Verify `VITE_EBAY_REDIRECT_URI` matches eBay app settings exactly
- Check that redirect URI is `https://localhost:3000/callback`
- Ensure eBay app has correct redirect URI configured

### Issue: "Network error" or API timeouts

**Solution:**
- Check internet connection
- Verify eBay API status
- Check if sandbox/production environment matches your credentials
- Increase timeout in `src/main/constants.ts` if needed

### Issue: "Please authenticate first" error

**Solution:**
- Ensure OAuth login completed successfully
- Check that access token was received
- Try logging out and logging back in
- Check logs for token-related errors

### Issue: Tests fail with "window is not defined"

**Solution:**
- Tests run in Node.js environment, not browser
- Mock `window.api` in test setup
- Use `jsdom` environment (already configured in `vitest.config.ts`)

### Issue: Build fails with linting errors

**Solution:**
```bash
npm run lint:fix
```

### Issue: TypeScript errors

**Solution:**
```bash
npm run typecheck
```

Fix any type errors shown.

### Issue: Dependencies not found

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Test Coverage

Check what's currently tested:

```bash
npm run test -- --coverage
```

**Note:** Coverage reporting may need additional configuration in `vitest.config.ts`.

---

## 🎯 Testing Workflow

### Recommended Testing Order:

1. **Setup Verification**
   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm run test
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Manual Testing**
   - Follow the manual testing checklist above
   - Test each feature systematically
   - Document any issues found

4. **Build Test**
   ```bash
   npm run build
   npm run start
   ```
   - Verify production build works
   - Test that all features still function

---

## 🔐 Security Testing

### Test Security Settings

1. **Verify Context Isolation**
   - In DevTools, try: `window.require` - should be `undefined`
   - Try: `window.process` - should be `undefined` (or limited)

2. **Verify Node Integration**
   - In renderer console: `typeof require` - should be `undefined`
   - `typeof process` - should be `undefined`

3. **Test OAuth Flow**
   - Verify tokens are not exposed in renderer
   - Check that client secret is not accessible

**Note:** Currently, `nodeIntegration: true` is enabled (security issue). For production, this should be `false`.

---

## 📝 Test Data

### Sample Test UPCs (Sandbox)

Use these for testing in sandbox mode:

- **Valid UPC-12:** `012345678905`
- **Valid EAN-13:** `1234567890128`
- **Valid EAN-8:** `12345670`

### Test User Credentials

Use your eBay sandbox account credentials for OAuth testing.

---

## 🚨 Pre-Production Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Manual testing completed
- [ ] Security settings reviewed (fix `nodeIntegration` and `sandbox`)
- [ ] Environment variables set for production
- [ ] `VITE_EBAY_SANDBOX=false` for production
- [ ] Logs reviewed for sensitive data
- [ ] Error handling tested
- [ ] Build succeeds: `npm run build`

---

## 📚 Additional Resources

- **eBay API Documentation:** https://developer.ebay.com/
- **Electron Documentation:** https://www.electronjs.org/docs
- **Vue 3 Documentation:** https://vuejs.org/
- **Vitest Documentation:** https://vitest.dev/

---

## 💡 Tips

1. **Use Sandbox First:** Always test with `VITE_EBAY_SANDBOX=true` first
2. **Check Logs:** The log file is your best friend for debugging
3. **DevTools:** Use F12 to inspect network requests and console errors
4. **Incremental Testing:** Test one feature at a time
5. **Document Issues:** Keep notes on any problems you encounter

---

## 🆘 Getting Help

If you encounter issues:

1. Check the logs (`eeeeee-bay.log`)
2. Check DevTools console (F12)
3. Verify environment variables are set
4. Review the README.md troubleshooting section
5. Check eBay API status
6. Verify your eBay app credentials are correct

---

**Happy Testing! 🎉**

