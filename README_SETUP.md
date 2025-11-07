# Mind Buddy Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# The default configuration points to:
# VITE_API_URL=http://localhost:5000
```

### 3. Start Backend Server (Required)
Before starting the frontend, ensure the backend is running on port 5000:
```bash
cd ../backend
python run.py
```

### 4. Start Frontend Dev Server
```bash
npm run dev
```

The frontend will be available at: **http://localhost:8080**

---

## What Was Fixed

All frontend stability issues have been resolved. See [FRONTEND_FIXES.md](./FRONTEND_FIXES.md) for detailed documentation.

### Summary of Fixes:
✅ **Unique React keys** - Fixed missing keys in MoodTracker component  
✅ **API Configuration** - Added environment variable support via VITE_API_URL  
✅ **Vite Proxy** - Configured proxy to forward /api requests to backend  
✅ **File Watching** - Added ignores for OneDrive temp files to prevent crashes  
✅ **React Router** - Added v7 future flags to silence warnings  
✅ **Static Assets** - Verified all assets exist and are properly referenced  

---

## Troubleshooting

### Dev Server Crashes
If you experience crashes with file read errors:
- Ensure the repository is **not** inside OneDrive or other cloud sync folders
- The Vite config now ignores OneDrive files, but moving outside is recommended

### API Connection Errors
If you see `ERR_CONNECTION_REFUSED`:
1. Verify backend is running on port 5000
2. Check `.env` file has correct `VITE_API_URL`
3. Restart the dev server after changing `.env`

### Console Warnings
After these fixes, you should see **NO**:
- "Each child in a list should have a unique 'key' prop" warnings
- React Router v7 migration warnings
- Asset 404 errors

---

## Development Scripts

```bash
npm run dev        # Start development server (port 8080)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Git Commits Applied

The following commits were made to fix the frontend:

```bash
fix(mood): add unique key for mood list items
fix(vite): add proxy and file watch configuration
fix(api): use VITE_API_URL environment variable
fix(router): add React Router v7 future flags
chore(docs): add .env.example and FRONTEND_FIXES.md
```

---

## Important Notes

- **Backend Port**: Do NOT change backend port from 5000 (per requirements)
- **Frontend Port**: Frontend runs on 8080 by default
- **Environment Variables**: Always use `.env` for local configuration (never commit it)
- **OneDrive**: If repo is in OneDrive, consider moving it for better stability

For detailed technical information about each fix, see [FRONTEND_FIXES.md](./FRONTEND_FIXES.md).
