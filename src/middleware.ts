import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware();

// Match all routes except static assets and API routes
export const config = {
  matcher: [
    '/((?!api|_next|.*\\.).*)',
    '/api/auth/:path*'
  ]
};
