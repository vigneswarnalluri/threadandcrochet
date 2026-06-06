import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth:
     * - /account and all sub-paths
     * - /orders and all sub-paths
     * - /account-* pages (billing, password, wishlists)
     * - /api/profile and /api/logout (need session refresh)
     *
     * This avoids running a Supabase network call on every public page load.
     */
    '/account/:path*',
    '/orders/:path*',
    '/account-billing/:path*',
    '/account-password/:path*',
    '/account-wishlists/:path*',
    '/checkout',
    '/api/profile',
    '/api/logout',
  ],
}
