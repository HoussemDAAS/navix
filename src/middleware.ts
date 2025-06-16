import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr', 'ar'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always show the locale in the URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ar|fr|en)/:path*',
    
    // Enable redirects that add missing locales
    // Exclude Sanity Studio, API routes, static files, and Next.js internals
    '/((?!api|sanity|studio|_next|_vercel|.*\\..*).*)'
  ]
};