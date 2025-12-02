# Quick Start - Testing Your Local Setup

## 🚀 Quick Commands

### 1. Verify Setup (First Time)
```bash
npm run verify
```
This checks:
- ✅ Node.js version (18+)
- ✅ Dependencies installed
- ✅ .env file exists and configured
- ✅ TypeScript config present

### 2. Install Dependencies (If Needed)
```bash
npm install
```

### 3. Run All Checks
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Run Tests in Watch Mode
```bash
npm run test:watch
```

### 6. Run Tests with UI
```bash
npm run test:ui
```

---

## 📝 Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Run `npm install`
- [ ] Create `.env` file with eBay API credentials
- [ ] Run `npm run verify` to check setup
- [ ] Run `npm run test` to verify tests pass
- [ ] Run `npm run dev` to start application

---

## 🔧 Environment Variables Required

Create `.env` file in project root:

```env
VITE_EBAY_CLIENT_ID=your_app_id
VITE_EBAY_CLIENT_SECRET=your_cert_id
VITE_EBAY_DEV_ID=your_dev_id
VITE_EBAY_REDIRECT_URI=https://localhost:3000/callback
VITE_EBAY_SANDBOX=true
```

---

## 🧪 Testing Workflow

1. **Verify Setup**
   ```bash
   npm run verify
   ```

2. **Run Tests**
   ```bash
   npm run test
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

4. **Manual Testing**
   - Login with eBay OAuth
   - Configure policies
   - Test UPC search
   - Create a test listing

---

## 🐛 Quick Troubleshooting

**Tests fail?**
```bash
npm install
npm run test
```

**Type errors?**
```bash
npm run typecheck
```

**Lint errors?**
```bash
npm run lint:fix
```

**App won't start?**
- Check `.env` file exists
- Verify environment variables are set
- Check logs: `eeeeee-bay.log`

---

## 📚 Full Documentation

- **Testing Guide:** See `TESTING_GUIDE.md` for detailed testing instructions
- **Code Review:** See `CODE_REVIEW.md` for code quality notes
- **README:** See `README.md` for full project documentation

---

## 💡 Pro Tips

1. **Use Sandbox First:** Always test with `VITE_EBAY_SANDBOX=true`
2. **Check Logs:** View `eeeeee-bay.log` for debugging
3. **DevTools:** Press F12 in the app to open DevTools
4. **Watch Mode:** Use `npm run test:watch` during development

---

**Need Help?** Check `TESTING_GUIDE.md` for detailed instructions!

