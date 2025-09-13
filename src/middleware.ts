import { clerkMiddleware } from '@clerk/nextjs/server';

// Attach Clerk auth state; protect routes in code where needed
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
};
