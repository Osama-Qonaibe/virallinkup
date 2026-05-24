---
Task ID: 1
Agent: Super Z (Main)
Task: Implement session persistence - login state and user preferences survive page refresh and navigation

Work Log:
- Analyzed current architecture: Zustand store in-memory only, no JWT, no cookies, no session validation
- Installed `jsonwebtoken`, `js-cookie` and their type definitions
- Created `src/lib/jwt.ts` - JWT utility with sign, verify, cookie set/clear helpers
- Updated `src/app/api/auth/login/route.ts` - Now sets httpOnly JWT cookie (30-day expiry) on successful login
- Updated `src/app/api/auth/register/route.ts` - Now sets httpOnly JWT cookie on successful registration
- Updated `src/app/api/auth/google/route.ts` - Now sets httpOnly JWT cookie on successful Google auth
- Created `src/app/api/auth/me/route.ts` - GET endpoint to validate JWT cookie and return user data
- Created `src/app/api/auth/logout/route.ts` - POST endpoint to clear the token cookie
- Updated `src/lib/store.ts` - Added Zustand `persist` middleware to save `currentLang`, `user`, `isAdmin` to localStorage
- Created `src/components/AuthInitializer.tsx` - Shows branded loading screen, calls /api/auth/me to restore session, applies language direction
- Updated `src/app/layout.tsx` - Added inline script to read lang preference from localStorage BEFORE React hydrates (prevents flash of wrong direction)
- Updated `src/app/page.tsx` - Wrapped app content with `<AuthInitializer>` component
- Updated `src/components/SiteHeader.tsx` - Changed logout to call /api/auth/logout API endpoint before clearing local state

Stage Summary:
- Session persistence fully implemented: JWT in httpOnly cookie (30 days) + Zustand persist to localStorage
- User stays logged in after page refresh or navigation
- Language preference (AR/EN) persists across sessions
- RTL/LTR direction is applied immediately on page load (no flash)
- Branded loading animation shown while session is being restored
- Logout properly clears both server cookie and client state
- Build passes successfully with all routes compiled
