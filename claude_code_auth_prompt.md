# Claude Code: Build Authentication System (Plan Mode)

Use this prompt in Claude Code with **Plan Mode** enabled to build a complete email authentication system.

---

## The Prompt

```
I need you to build a complete email authentication system for my workout tracking application. We are using Supabase as our backend. Enter plan mode and create a comprehensive implementation plan.

## Project Context
- **Backend**: Supabase (PostgreSQL database + Supabase Auth)
- **Frontend**: [YOUR FRAMEWORK - e.g., Next.js 14 with App Router / React / etc.]
- **Styling**: [YOUR STYLING - e.g., Tailwind CSS / shadcn/ui / etc.]

## Authentication Features Required

### 1. User Registration (Sign Up)
- Email and password registration form
- Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- Email validation
- Email confirmation flow (user must verify email before accessing app)
- Handle duplicate email errors gracefully
- Success message and redirect after signup

### 2. User Login (Sign In)
- Email and password login form
- "Remember me" option
- Error handling for invalid credentials
- Redirect to dashboard/home after successful login
- Session persistence across page refreshes

### 3. Password Reset
- "Forgot password" link on login page
- Password reset request form (enter email)
- Password reset email with secure link
- New password form with confirmation field
- Password validation matching signup requirements
- Success message and redirect to login

### 4. Email Verification
- Resend verification email option
- Handle unverified users trying to access protected routes
- Show clear message about email verification status
- Verification success page

### 5. Session Management
- Automatic token refresh
- Session timeout handling
- Logout functionality (clear session, redirect to login)
- "Sign out everywhere" option for security

### 6. Protected Routes
- Middleware to protect authenticated routes
- Redirect unauthenticated users to login
- Redirect authenticated users away from login/signup pages
- Loading states while checking authentication

### 7. User Profile
- Display user email and account info
- Change password functionality
- Delete account option with confirmation
- Update email (with re-verification)

## Security Requirements
- CSRF protection
- Rate limiting on auth endpoints
- Secure password hashing (handled by Supabase)
- HttpOnly cookies for session tokens
- Input sanitization on all forms
- CAPTCHA integration option (hCaptcha or Turnstile)

## UI/UX Requirements
- Clean, modern form designs
- Inline validation with helpful error messages
- Loading states on all buttons during async operations
- Toast notifications for success/error feedback
- Mobile-responsive layouts
- Accessible forms (proper labels, ARIA attributes, keyboard navigation)

## File Structure to Create
```
/app (or /src)
├── /auth
│   ├── /login
│   │   └── page.tsx
│   ├── /signup
│   │   └── page.tsx
│   ├── /forgot-password
│   │   └── page.tsx
│   ├── /reset-password
│   │   └── page.tsx
│   ├── /verify-email
│   │   └── page.tsx
│   └── /callback
│       └── route.ts
├── /components
│   ├── /auth
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── AuthProvider.tsx
│   └── /ui
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── FormError.tsx
│       └── Toast.tsx
├── /lib
│   └── /supabase
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── /hooks
│   ├── useAuth.ts
│   └── useUser.ts
└── middleware.ts
```

## Implementation Order
1. Set up Supabase clients (browser + server)
2. Create auth middleware for protected routes
3. Build signup flow with email verification
4. Build login flow with session management
5. Build password reset flow
6. Build user profile management
7. Add UI polish (loading states, toasts, animations)
8. Write tests for all auth flows

## Testing Requirements
- Unit tests for form validation logic
- Integration tests for auth API calls
- E2E tests for complete auth flows (signup → verify → login → logout)
- Test error states and edge cases

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)
```

---

Please analyze my existing codebase first, then create a detailed plan covering:
1. What files need to be created
2. What existing files need modification
3. Database schema changes (if any)
4. Step-by-step implementation order
5. Potential challenges and how to handle them

After I approve the plan, implement each component fully with proper error handling, types, and tests.
```

---

## Before Using This Prompt

### 1. Fill in your project details
Replace the placeholders:
- `[YOUR FRAMEWORK]` → e.g., "Next.js 14 with App Router"
- `[YOUR STYLING]` → e.g., "Tailwind CSS with shadcn/ui components"

### 2. Enable Plan Mode in Claude Code
Run: `claude --plan` or type `/plan` in Claude Code

### 3. Have your Supabase project ready
- Create a project at [supabase.com](https://supabase.com)
- Get your URL and anon key from Project Settings → API
- Enable email auth in Authentication → Providers → Email

---

## Why Supabase Auth?

Since you're already using Supabase for your database, Supabase Auth is the best choice:

| Feature | Supabase Auth |
|---------|---------------|
| **Free Tier** | 50,000 monthly active users |
| **Email Auth** | ✅ Built-in |
| **Password Reset** | ✅ Built-in |
| **Email Verification** | ✅ Built-in |
| **Social Logins** | ✅ Google, GitHub, etc. |
| **Row Level Security** | ✅ Native integration |
| **No Extra Cost** | ✅ Included with Supabase |
| **SSR Support** | ✅ @supabase/ssr package |

### Comparison with Alternatives

| Provider | Free MAUs | Setup Time | Best For |
|----------|-----------|------------|----------|
| **Supabase** | 50,000 | 1-2 hours | You're already using Supabase |
| **Firebase** | 50,000 | 2-3 hours | Google ecosystem |
| **Clerk** | 10,000 | 15 min | Fast MVP, pre-built UI |
| **Auth0** | 7,500 | 1-2 days | Enterprise, complex RBAC |

**Recommendation:** Stick with Supabase Auth — it's free, already integrated with your database, and handles Row Level Security natively.

---

## Supabase Dashboard Setup

Before running the prompt, configure these in your Supabase Dashboard:

### 1. Enable Email Provider
`Authentication → Providers → Email`
- Enable email provider ✅
- Enable "Confirm email" ✅

### 2. Configure Redirect URLs
`Authentication → URL Configuration`
Add these URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

### 3. Customize Email Templates (Optional)
`Authentication → Email Templates`
- Customize confirmation email
- Customize password reset email

### 4. Configure SMTP (For Production)
`Authentication → SMTP Settings`
- Use Resend, SendGrid, or your preferred provider
- Default limit is only 2 emails/hour

---

## Quick Reference: Key Supabase Auth Functions

```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// Sign Out
const { error } = await supabase.auth.signOut()

// Get Current User
const { data: { user } } = await supabase.auth.getUser()

// Password Reset Request
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yourapp.com/auth/reset-password'
})

// Update Password
const { error } = await supabase.auth.updateUser({
  password: 'newpassword'
})

// Listen for Auth Changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```
