# Copilot instructions for Ayoo (merchant dashboard)

This file contains focused, actionable guidance for automated coding agents (Copilot-like) working on this repository. Use these rules to be immediately productive and avoid wasting cycles on generic tasks.

1. Big picture / architecture
   - Frontend: Next.js (app/ directory) with React 18, TypeScript and Tailwind. Pages live under `app/` (app-router). See `app/layout.tsx` which wraps the app in `AuthProvider`.
   - Auth & session: `lib/AuthContext.tsx` provides app-wide auth; it calls `BackendlessService` for login/register/logout and exposes `useAuth()` from `hooks/useAuth.ts`.
   - Backend: Backendless (SDK) is used directly from the browser via `lib/backendless.ts`. Tables used: `Categories`, `Products`, `Deals`, `StoreInfo`.
   - UI primitives: `components/ui/*` are lightweight wrappers around Radix UI + custom components (e.g. `dropdown-menu.tsx`, `avatar.tsx`, `toast.tsx`). Prefer using these components instead of raw Radix primitives.

2. Data flows & service boundaries (what to edit where)
   - All server calls live in `lib/backendless.ts` (single service class `BackendlessService`). Modify this file when changing storage, table names, or Backendless configuration.
   - User/session state is managed in `AuthContext`. When you add auth-related UI, read/update `AuthContext` (use `useAuth()`), don't re-implement session logic.
   - Store data model: `StoreInfo` entries are keyed by `merchantId` (pattern: `merchant_{user.objectId}` if not provided). See uses in `app/dashboard/store/page.tsx` and `app/dashboard/settings/page.tsx`.

3. Conventions & patterns to follow
   - "use client" is used at the top of client components. If a file uses hooks or browser APIs, mark it `use client`.
   - Centralized UI: Prefer `components/ui/*` wrappers to keep styling and accessibility consistent.
   - Types: Domain types (MerchantUser, Category, Product, Deal, StoreInfo) are declared in `lib/backendless.ts` — import these types from that file for consistency.
   - Routing: Use `next/navigation` (client hooks) for client-side navigation in interactive components. Example: `const router = useRouter(); router.push('/dashboard/settings')` (see `components/dashboard-layout.tsx`).

4. Developer workflows & useful commands
   - Install & run (preferred with pnpm):
     ```powershell
     cd <project-root>
     pnpm install
     pnpm dev
     ```
     If pnpm is not available: `npm install` and `npm run dev`.
   - Use workspace TypeScript in VS Code: Command Palette -> "TypeScript: Select TypeScript Version" -> "Use Workspace Version" and restart TS server.
   - Build: `pnpm build` (or `npm run build`) runs Next build.

5. Integration & runtime notes
   - Backendless config is currently hard-coded in `lib/backendless.ts` (applicationId, jsApiKey, etc.). For production / collaboration, move these into environment variables and `process.env` or Next runtime config.
   - File uploads call `Backendless.Files.upload(file, path, true)` and store `fileURL` on the model (see `uploadFile` in `lib/backendless.ts`). When changing upload behavior, update both backendless helper and any UI that expects `logoUrl`.

6. Project-specific gotchas discovered while exploring
   - `AuthProvider` checks current user on mount using `BackendlessService.getCurrentUser()` — registration flow must ensure a session is established after sign-up (we added an auto-login post-registration in `lib/backendless.ts`).
   - Toasts are implemented with a custom hook `hooks/use-toast.ts` and a `Toaster` consumer at `components/ui/toaster.tsx`. Ensure `Toaster` is mounted (layout or root) for toasts to appear.
   - Settings page supports `?tab=account` to auto-open the account dialog (`app/dashboard/settings/page.tsx`). Prefer deep-linking to the settings page using query params.

7. Where to make changes for common tasks
   - Add/remove tables or change data shape: `lib/backendless.ts` + update TypeScript interfaces there.
   - New global UI widget (toaster, modal): add UI wrapper in `components/ui/` and mount it in `app/layout.tsx` or `components/dashboard-layout.tsx`.
   - Auth logic changes: `lib/AuthContext.tsx` (state), `hooks/useAuth.ts` (consumer hook), and `lib/backendless.ts` (actual network calls).

8. Examples (copy-paste patterns)
   - Client navigation in a menu item:
     ```tsx
     const router = useRouter()
     <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Settings</DropdownMenuItem>
     ```
   - Calling backend service and setting state:
     ```ts
     const info = await BackendlessService.getStoreInfo(merchantId)
     setStoreInfo(info)
     ```

9. Tests & CI
   - There are no tests or CI workflows present. If creating tests, prefer React Testing Library + Vitest/Jest for components and small unit tests for `lib/*` helpers.

If anything above is unclear or you want me to expand on a specific area (environment variables, moving Backendless config to env, or adding a profile route vs settings-tab behavior), tell me which area and I'll iterate.
