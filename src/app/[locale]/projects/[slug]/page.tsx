/* eslint-disable @typescript-eslint/no-explicit-any */
// app/projects/[slug]/page.tsx
import MainLayout from "@/components/main-layout";
import ProjectSummarySection from "@/components/ProjectSummarySection";
import ProjectHero from "@/components/ProjectHero";
import ContentBlockRenderer from "@/components/ContentBlockRenderer";
import { fetchProjectBySlug } from "@/services/projectService";
import { notFound } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { Link } from "@/i18n/routing"; // Use i18n Link instead of next/link
import AIRecommendations from "@/components/AIRecommendations";

// Enhanced translations object with more comprehensive content
const translations = {
  en: {
    navigation: {
      home: "Home",
      projects: "Projects"
    },
    project: {
      resultsTitle: "real results.",
      client: "Client",
      format: "Format",
      viewProject: "View Live Project",
      liveProject: "Live Project",
      timeline: "Timeline"
    },
    contentBlocks: {
      videoShowcase: "Video Showcase",
      imageGallery: "Image Gallery",
      keyResults: "Key Results",
      uiShowcase: "UI Showcase",
      viewPrototype: "View Interactive Prototype",
      brandAssets: "Brand Assets",
      viewStyleGuide: "View Complete Style Guide"
    },
    sections: {
      overview: "Project Overview",
      process: "Our Process",
      results: "Results & Impact",
      nextProject: "Explore More Projects"
    }
  },
  fr: {
    navigation: {
      home: "Accueil",
      projects: "Projets"
    },
    project: {
      resultsTitle: "de vrais résultats.",
      client: "Client",
      format: "Format",
      viewProject: "Voir le Projet en Direct",
      liveProject: "Projet en Direct",
      timeline: "Chronologie"
    },
    contentBlocks: {
      videoShowcase: "Vitrine Vidéo",
      imageGallery: "Galerie d'Images",
      keyResults: "Résultats Clés",
      uiShowcase: "Vitrine Interface Utilisateur",
      viewPrototype: "Voir le Prototype Interactif",
      brandAssets: "Assets de Marque",
      viewStyleGuide: "Voir le Guide de Style Complet"
    },
    sections: {
      overview: "Aperçu du Projet",
      process: "Notre Processus",
      results: "Résultats et Impact",
      nextProject: "Explorer Plus de Projets"
    }
  },
  ar: {
    navigation: {
      home: "الرئيسية",
      projects: "المشاريع"
    },
    project: {
      resultsTitle: "نتائج حقيقية.",
      client: "العميل",
      format: "التنسيق",
      viewProject: "عرض المشروع المباشر",
      liveProject: "المشروع المباشر",
      timeline: "الجدول الزمني"
    },
    contentBlocks: {
      videoShowcase: "عرض الفيديو",
      imageGallery: "معرض الصور",
      keyResults: "النتائج الرئيسية",
      uiShowcase: "عرض واجهة المستخدم",
      viewPrototype: "عرض النموذج الأولي التفاعلي",
      brandAssets: "أصول العلامة التجارية",
      viewStyleGuide: "عرض دليل الأسلوب الكامل"
    },
    sections: {
      overview: "نظرة عامة على المشروع",
      process: "عمليتنا",
      results: "النتائج والتأثير",
      nextProject: "استكشاف المزيد من المشاريع"
    }
  }
};

interface Params {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function ProjectPage({ params }: Params) {
  const { slug, locale } = await params;
  const project = await fetchProjectBySlug(slug);
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  if (!project) {
    return notFound();
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with grid pattern and gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
      </div>
      
      <MainLayout>
        <div className="relative" dir={isRTL ? "rtl" : "ltr"}>
          {/* Refined Breadcrumb Navigation */}
          <nav className="container mx-auto px-4 pt-6 pb-2" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link 
                  href={`/${locale}`} 
                  className="group flex items-center gap-2 text-gray-500 hover:text-lochmara-600 dark:text-gray-400 
                           dark:hover:text-lochmara-400 transition-colors duration-200"
                >
                  <FaHome className="text-xs group-hover:scale-110 transition-transform duration-200" />
                  <span>{t.navigation.home}</span>
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li>
                <Link 
                  href={`/${locale}/projects`} 
                  className="text-gray-500 hover:text-lochmara-600 dark:text-gray-400 dark:hover:text-lochmara-400 
                           transition-colors duration-200"
                >
                  {t.navigation.projects}
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li className="font-medium text-lochmara-600 dark:text-lochmara-400 truncate max-w-xs md:max-w-md">
                {project.title}
              </li>
            </ol>
          </nav>

          {/* Project Hero Section */}
          <ProjectHero 
            project={project} 
            locale={locale} 
            translations={t} 
          />

          {/* Content Sections with Better Spacing */}
          <div className="relative">
            {/* Project Content Blocks */}
            {project.content && project.content.length > 0 && (
              <section className="relative">
                {/* Section Divider */}
                <div className="container mx-auto px-4 py-12">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lochmara-200 to-transparent"></div>
                    <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm 
                                  rounded-full px-6 py-3 border border-lochmara-200/50 shadow-lg">
                      <div className="w-2 h-2 bg-lochmara-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.sections.process}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lochmara-200 to-transparent"></div>
                  </div>
                </div>

                {/* Content Blocks with Improved Spacing */}
                <div className="space-y-24">
                  {project.content.map((block, index) => (
                    <div key={block._key || index} className="relative">
                      {/* Minimal Block Indicator */}
                      <div className="absolute -left-4 top-8 hidden lg:block z-10">
                        <div className="w-8 h-8 bg-lochmara-500 rounded-full flex items-center justify-center 
                                      text-white font-semibold text-sm shadow-lg">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                      
                      <ContentBlockRenderer 
                        block={block} 
                        translations={t}
                        locale={locale}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Recommendations Section */}
            <section className="py-20 relative">
              <div className="container mx-auto px-4">
                {/* Section Divider */}
                <div className="flex items-center gap-6 mb-16">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lochmara-200 to-transparent"></div>
                  <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm 
                                rounded-full px-6 py-3 border border-lochmara-200/50 shadow-lg">
                    <div className="w-2 h-2 bg-lochmara-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI Insights
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lochmara-200 to-transparent"></div>
                </div>
                
                <AIRecommendations projectId={project._id} />
              </div>
            </section>

            {/* Project Summary Section */}
            <section className="py-20 relative">
              <div className="container mx-auto px-4">
                <ProjectSummarySection />
              </div>
            </section>

            {/* Next Project Navigation */}
          
          </div>
        </div>
      </MainLayout>
    </div>
  );
}