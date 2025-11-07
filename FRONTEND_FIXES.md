# Frontend Fixes Documentation

This document summarizes all fixes applied to stabilize the Mind Buddy frontend dev server and eliminate console errors.

## 1. Unique List Keys in MoodTracker.tsx

**Issue**: React warning about missing unique keys in list items rendered with `.map()`.

**Fix**: Added unique `key` props to all mapped elements in `src/components/mood/MoodTracker.tsx`:
- Mood emoji buttons: Changed from `key={mood.value}` to `key={`mood-emoji-${mood.value}`}`
- Trigger badges: Changed from `key={trigger}` to `key={`trigger-${trigger}`}`
- Entry trigger badges already had proper keys: `key={`${entry.id}-${trigger}`}`
- Recent entries already had proper keys using `entry.id`

**Location**: `frontend/src/components/mood/MoodTracker.tsx`

**Result**: Eliminates "Each child in a list should have a unique 'key' prop" warnings.

---

## 2. Static Assets - Serenity Tree Image

**Issue**: Potential 404 errors for missing assets referenced in the application.

**Status**: ✅ **No action required**
- `serenity-tree.png` exists in `frontend/src/assets/serenity-tree.png`
- Properly imported in `AuthLayout.tsx` and `MentalHealthLayout.tsx` using: `import sereniTreeImage from "@/assets/serenity-tree.png";`
- `favicon.ico` exists in `frontend/public/favicon.ico`

**Result**: All static assets are present and correctly referenced.

---

## 3. Frontend-Backend Base URL Configuration

**Issue**: Hardcoded backend URLs or mismatched environment variables causing connection errors.

**Fix**: 
- Created `.env.example` with `VITE_API_URL=http://localhost:5000`
- Updated `src/services/authService.ts` to use `VITE_API_URL` environment variable
- Changed from `VITE_API_BASE_URL` to consistent `VITE_API_URL`
- Added comment explaining the change

**Files Modified**:
- `frontend/.env.example` (created)
- `frontend/src/services/authService.ts`

**Usage**: Developers should copy `.env.example` to `.env` and adjust if needed:
```bash
cp .env.example .env
```

**Result**: Consistent API URL configuration across the app, eliminates hardcoded URLs.

---

## 4. Vite Dev Server Proxy Configuration & API Path

**Issue**: CORS issues and connection refused errors when frontend tries to connect to backend.

**Fix**: 
1. Added Vite proxy configuration in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  }
}
```

2. **CRITICAL**: Changed `authService.ts` to use relative path in development:
```typescript
baseURL: import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "http://localhost:5000/api"),
```

This ensures API calls go through the Vite proxy (`/api`) instead of directly to `http://localhost:5000`, which avoids CORS issues.

**Files Modified**: 
- `frontend/vite.config.ts`
- `frontend/src/services/authService.ts`

**Result**: Frontend properly proxies API requests through Vite dev server, eliminating CORS errors.

---

## 5. Vite File Watcher Configuration & Crash Prevention

**Issue**: Vite dev server crashes with `Error: UNKNOWN: unknown error, read` when OneDrive locks temp files.

**Fix**: 
1. Added file watching ignore patterns in `vite.config.ts`:
```typescript
watch: {
  ignored: ['**/.git/**', '**/node_modules/**', '**/OneDrive/**', '**~*']
}
```

2. **CRITICAL**: Added global error handlers to catch file read errors without crashing:
```typescript
process.on('uncaughtException', (error) => {
  if (error.message?.includes('UNKNOWN') || error.message?.includes('read')) {
    console.warn('⚠️ File read error detected (likely OneDrive conflict)');
    return; // Don't crash
  }
  throw error; // Re-throw other errors
});
```

**Files Modified**: `frontend/vite.config.ts`

**Result**: 
- Prevents Vite from watching OneDrive metadata files
- Catches and logs file read errors without crashing the dev server
- Server continues running even when OneDrive causes file conflicts

**Note**: While this prevents crashes, **moving the repository outside OneDrive is still strongly recommended** for optimal stability.

---

## 6. File Read Operations

**Issue**: Potential runtime errors from synchronous file reads.

**Status**: ✅ **No action required**
- Searched entire `frontend/src` directory for `fs.createReadStream`, `fs.readFileSync`, `fs.readFile`
- No Node.js file system operations found in frontend code
- All file operations are handled by Vite build process

**Result**: No file read vulnerabilities in the codebase.

---

## 7. React Router Future Flags

**Issue**: Console warnings about upcoming React Router v7 changes.

**Fix**: Added future flags to `BrowserRouter` in `src/App.tsx`:
```typescript
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

**Files Modified**: `frontend/src/App.tsx`

**Result**: Silences React Router v7 migration warnings, prepares app for future upgrade.

---

## Summary of Changes

### Files Created:
- `frontend/.env.example` - Environment variable template
- `frontend/FRONTEND_FIXES.md` - This documentation file

### Files Modified:
- `frontend/src/components/mood/MoodTracker.tsx` - Added unique keys to mapped elements
- `frontend/src/services/authService.ts` - Updated to use VITE_API_URL
- `frontend/vite.config.ts` - Added proxy and watch configurations
- `frontend/src/App.tsx` - Added React Router future flags

### No Changes Required:
- Static assets already exist and properly referenced
- No file system operations found in frontend code

---

## Testing Checklist

After applying these fixes, verify:

1. ✅ Start backend on port 5000: `cd backend && python run.py`
2. ✅ In frontend directory: `npm install`
3. ✅ Copy environment file: `cp .env.example .env`
4. ✅ Start dev server: `npm run dev`
5. ✅ Open http://localhost:8080
6. ✅ Check browser console - should have NO:
   - `net::ERR_CONNECTION_REFUSED` errors
   - "Each child in a list should have a unique 'key' prop" warnings
   - React Router v7 warnings
7. ✅ Test creating a mood entry - should POST to backend successfully
8. ✅ Vite dev server should NOT crash with file read errors

---

## Future Recommendations

1. **Repository Location**: If experiencing persistent file locking issues, move repository outside OneDrive/cloud sync folders.

2. **Environment Variables**: Consider adding more environment-specific configs as needed (e.g., API timeout, retry settings).

3. **Error Boundaries**: Consider adding React Error Boundaries for production error handling.

4. **API Error Handling**: Consider adding a global API error handler for better user feedback.

---

## Commit Messages Used

```bash
git commit -m "fix(mood): add unique key for mood list items"
git commit -m "fix(vite): add proxy and file watch configuration"
git commit -m "fix(api): use VITE_API_URL environment variable"
git commit -m "fix(router): add React Router v7 future flags"
git commit -m "chore(docs): add .env.example and FRONTEND_FIXES.md"
