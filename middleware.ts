import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr', 'ar'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always show the locale in the URL
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  
  // Handle redirect from non-www to www with locale in one step
  if (hostname === 'navixagency.tech') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.navixagency.tech';
    
    // If it's the root path, redirect directly to /en to avoid double redirect
    if (pathname === '/') {
      url.pathname = '/en';
      return NextResponse.redirect(url, 301);
    }
    
    // For other paths, redirect to www and let intl middleware handle locale
    return NextResponse.redirect(url, 301);
  }
  
  // Handle the case where someone visits www.navixagency.tech/ directly
  if (hostname === 'www.navixagency.tech' && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 301);
  }
  
  // Apply internationalization middleware for all other cases
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, exclude API routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    '/(ar|fr|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    // BUT exclude API routes, static files, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};