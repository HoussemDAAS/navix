import { MetadataRoute } from 'next'
import { fetchProjects } from '@/services/projectService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://navixagency.tech'
  const locales = ['en', 'fr', 'ar']
  
  // Main pages for each locale
  const pages = [
    '',
    '/about',
    '/projects', 
    '/meeting',
    '/services',
    '/guarantees'
  ]

  // Generate sitemap entries for all locale + page combinations
  const sitemap: MetadataRoute.Sitemap = []

  locales.forEach(locale => {
    pages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            'en': `${baseUrl}/en${page}`,
            'fr': `${baseUrl}/fr${page}`, 
            'ar': `${baseUrl}/ar${page}`,
          }
        }
      })
    })
  })

  // Fetch real project slugs from CMS
  try {
    const projects = await fetchProjects()
    
    projects.forEach(project => {
      if (project.slug) {
        locales.forEach(locale => {
          sitemap.push({
            url: `${baseUrl}/${locale}/projects/${project.slug}`,
            lastModified: new Date(project._updatedAt || new Date()),
            changeFrequency: 'monthly',
            priority: 0.6,
            alternates: {
              languages: {
                'en': `${baseUrl}/en/projects/${project.slug}`,
                'fr': `${baseUrl}/fr/projects/${project.slug}`,
                'ar': `${baseUrl}/ar/projects/${project.slug}`,
              }
            }
          })
        })
      }
    })
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
    // Continue without project URLs if there's an error
  }

  return sitemap
}