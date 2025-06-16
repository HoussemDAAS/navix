import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Space_Grotesk } from "next/font/google";
import TranslationProvider from '@/components/TranslationProvider';
import WebVitals from '@/components/WebVitals';
import type { Metadata } from 'next';

const font = Space_Grotesk({
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

const locales = ['en', 'fr', 'ar'] as const;
type Locale = typeof locales[number];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

// SEO Metadata for each locale
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  
  const seoData = {
    en: {
      title: "Navix - Digital Growth Agency | Web Development & Marketing",
      description: "Transform your business with Navix's 360° digital solutions. Expert web development, marketing strategy, video production & branding. 90% projects launch in 14 days.",
      keywords: "digital marketing agency, web development, Next.js development, marketing strategy, video production, branding, SEO, social media marketing, Morocco",
    },
    fr: {
      title: "Navix - Agence de Croissance Digitale | Développement Web & Marketing",
      description: "Transformez votre entreprise avec les solutions digitales 360° de Navix. Développement web expert, stratégie marketing, production vidéo & branding.",
      keywords: "agence marketing digital, développement web, développement Next.js, stratégie marketing, production vidéo, branding, SEO, marketing réseaux sociaux, Maroc",
    },
    ar: {
      title: "نافيكس - وكالة النمو الرقمي | تطوير المواقع والتسويق",
      description: "حوّل عملك مع حلول نافيكس الرقمية الشاملة. تطوير مواقع احترافي، استراتيجية تسويق، إنتاج فيديو وهوية بصرية.",
      keywords: "وكالة تسويق رقمي, تطوير مواقع, تطوير Next.js, استراتيجية تسويق, إنتاج فيديو, هوية بصرية, SEO, تسويق وسائل التواصل, المغرب",
    }
  };

  const currentLocale = locale as Locale;
  const data = seoData[currentLocale] || seoData.en;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    authors: [{ name: "Navix Agency" }],
    creator: "Navix Agency",
    publisher: "Navix Agency",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://navixagency.tech'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'fr': '/fr',
        'ar': '/ar',
      },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://navixagency.tech/${locale}`,
      siteName: 'Navix Agency',
      locale: locale,
      type: 'website',
      images: [
        {
          url: '/logo_navix.png',
          width: 1200,
          height: 630,
          alt: 'Navix Digital Growth Agency',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: ['/logo_navix.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Validate locale with proper typing
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages using the proper next-intl server function with explicit locale
  const messages = await getMessages({locale});

  // Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DigitalMarketingAgency",
    "name": "Navix Agency",
    "alternateName": "Navix Digital Growth Agency",
    "url": "https://navixagency.tech",
    "logo": "https://navixagency.tech/logo_navix.png",
    "description": "Digital marketing agency specializing in web development, marketing strategy, video production, and branding solutions for business growth.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@navixagency.tech"
    },
    "sameAs": [
      "https://linkedin.com/company/navix-agency",
      "https://instagram.com/navix.agency"
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "31.7917",
        "longitude": "-7.0926"
      }
    },
    "services": [
      {
        "@type": "Service",
        "name": "Web Development",
        "description": "Full-stack Next.js development with conversion optimization"
      },
      {
        "@type": "Service", 
        "name": "Digital Marketing Strategy",
        "description": "Data-driven marketing campaigns with 150%+ ROI increases"
      },
      {
        "@type": "Service",
        "name": "Video Production",
        "description": "4K video editing, motion graphics, and viral content creation"
      },
      {
        "@type": "Service",
        "name": "Brand Design",
        "description": "Complete brand identity and visual system design"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50"
    }
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <link rel="canonical" href={`https://navixagency.tech/${locale}`} />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {'dimension1': 'locale'}
              });
              gtag('config', 'GA_MEASUREMENT_ID', {
                'custom_parameter': '${locale}'
              });
            `,
          }}
        />
      </head>
      <body className={`${font.className} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <TranslationProvider>
            <WebVitals />
            {children}
          </TranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}