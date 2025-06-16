import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/studio/',
          '/admin/',
          '/_next/',
          '/private/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/studio/'],
      },
    ],
    sitemap: 'https://navixagency.tech/sitemap.xml',
    host: 'https://navixagency.tech'
  }
}