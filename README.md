# UbuntuNow Frontend

Welcome to the **UbuntuNow** frontend repository! This application serves as Kigali's premier social e-commerce platform, enabling sellers to easily create beautiful store profiles and customers to browse their products.

## Technology Stack
- **Vite**
- **React** (TypeScript)
- **Tailwind CSS**
- **shadcn-ui**

## Getting Started

Follow these steps to run the project locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

To build for production:
```bash
npm run build
```

## Admin console (`admin.ubuntunow.rw`)

The admin console lives in `src/app/admin` and is served **only** on the admin host. Public hosts return 404 for `/admin`; the admin host serves nothing else (see `src/middleware.ts`).

- **Sign-in:** email + password, then a 6-digit code emailed to the admin. Sessions use `sessionStorage` (cleared when the tab closes), tokens last 10 minutes and refresh for up to 8 hours, and an idle tab signs out after 30 minutes.
- **Access control:** the sidebar and pages follow each admin's permissions, but the real enforcement is on the backend. Only super admins see **Admins**, where they create admins and choose what each can access.
- **Setup:** add `admin.ubuntunow.rw` as a domain on the Vercel project (and the DNS record it asks for). To use a different host, set `ADMIN_HOSTS` (comma-separated) in the environment.
- **Local development:** `npm run dev`, then open `http://localhost:3000/admin/login` (localhost serves both the shop and the console).

## How sign-in is stored (shop site)
- The **refresh token** lives in an `HttpOnly` cookie (`ubn_refresh`, scoped to `/session`), so page scripts can never read it. The **access token** (15 minutes) is kept in memory only; nothing is stored in `localStorage` or readable cookies.
- Sign-in, OTP verification, refresh and sign-out go through the small server routes in `src/app/session/*`, which call the backend and manage the cookies (`src/lib/auth/server.ts`).
- `ubn_session=1` is a credential-free marker used by the route guard and the UI to know someone is signed in.
- Any request made outside `apiClient` must get its token from `await apiClient.getValidAccessToken()`.
- Tests: `npm run test:auth`.
