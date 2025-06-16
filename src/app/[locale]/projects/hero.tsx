/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useData } from "@/components/context/DataContext";
import { urlFor } from "@/sanity/lib/image";
import { Link } from "@/i18n/routing";
import { Search, Filter, Grid, List, Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

type TabId = "projects" | "clients";
type Locale = 'en' | 'fr' | 'ar';
type ViewMode = 'grid' | 'list';

interface CategoryCount {
  projects: number;
  clients: number;
}

interface CategoryCounts {
  [key: string]: CategoryCount;
}

interface ProjectHeroProps {
  locale: Locale;
}

const ProjectHero = ({ locale }: ProjectHeroProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("projects");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { categories, clients, projects } = useData();
  const { t } = useTranslations();
  const isRTL = locale === "ar";

  // Enhanced filtering with search
  const filteredData = useMemo(() => {
    const data = activeTab === "projects" ? projects : clients;
    
    return data.filter(item => {
      // Category filter
      const categoryMatch = activeCategory === "all" || 
        (activeTab === "projects" && 
         (item as any).categories.includes(activeCategory.toLowerCase())) ||
        (activeTab === "clients" && 
         (item as any).category.toLowerCase() === activeCategory.toLowerCase());

      // Search filter - handle both Project and Client types
      const searchMatch = searchQuery === "" || 
        ('title' in item && item.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('name' in item && item.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('description' in item && item.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (activeTab === "projects" && 'client' in item && item.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [activeTab, activeCategory, searchQuery, projects, clients]);

  const { tabCounts, categoryCounts } = useMemo(() => {
    const projectCount = projects.length;
    const clientCount = clients.length;
    const categoryCount: CategoryCounts = {
      all: { projects: projectCount, clients: clientCount },
    };
    categories.forEach(category => {
      categoryCount[category.title] = {
        projects: projects.filter(p => 
          p.categories.includes(category.title.toLowerCase() as typeof p.categories[number])
        ).length,
        clients: clients.filter(c => 
          c.category.toLowerCase() === category.title.toLowerCase()
        ).length,
      };
    });
    return {
      tabCounts: {
        projects: projectCount,
        clients: clientCount,
      },
      categoryCounts: categoryCount,
    };
  }, [categories, clients, projects]);

  const tabs = [
    { id: "projects" as const, name: t("Navigation.projects"), count: tabCounts.projects },
    { id: "clients" as const, name: t("Projects.filters.clients"), count: tabCounts.clients },
  ];

  const filterCategories = useMemo(() => [
    { id: "all", name: t("Projects.filters.all"), count: categoryCounts.all[activeTab] },
    ...categories.map(category => ({
      id: category.title,
      name: category.title,
      count: categoryCounts[category.title]?.[activeTab] || 0
    })),
  ], [categories, categoryCounts, activeTab, t]);

  // Enhanced render content with view modes
  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-16 ${isRTL ? "text-right" : ""}`}
        >
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t("Projects.filters.noResults")}</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        {activeTab === "clients" ? (
          <motion.div
            layout
            key="clients"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence>
            {filteredData.map((client) => (
              <motion.div
                layout
                key={client._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`border border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? `flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}` : ''
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className={`relative flex items-center justify-center ${
                  viewMode === 'list' ? 'h-16 w-24 flex-shrink-0' : 'h-32 mb-6'
                }`}>
                  <Image
                    priority
                    height={viewMode === 'list' ? 64 : 120}
                    width={viewMode === 'list' ? 96 : 200}
                    src={urlFor(client.logo).url()}
                    alt={client.name || client.name}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <h3 className={`font-bold mb-2 ${viewMode === 'list' ? 'text-lg' : 'text-2xl mb-4'} ${isRTL ? 'text-right' : ''}`}>
                    {client.name}
                  </h3>
                  <p className={`text-gray-600 leading-relaxed ${viewMode === 'list' ? 'text-sm mb-2' : 'mb-4'} ${isRTL ? 'text-right' : ''}`}>
                    {client.description}
                  </p>
                  {client.website && (
                    <div className={`mt-4 ${isRTL ? 'text-right' : ''}`}>
                      <Link
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-lochmara-600 hover:text-blue-800 font-medium transition-colors text-sm"
                      >
                        {t("Projects.project.visitWebsite")}
                        <svg className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link> 
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            layout
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              viewMode === 'grid' 
                ? "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
                : "space-y-6"
            }
          >
            <AnimatePresence>
            {filteredData.map((project) => {
              const mainImage = project.featuredImage || (project.content?.[0]?.images?.[0] || null);
              const slug = project.slug || "";
              const width = mainImage?.asset?.metadata?.dimensions?.width || 600;
              const height = mainImage?.asset?.metadata?.dimensions?.height || 400;
              
              return (
                <motion.div
                  layout
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={viewMode === 'grid' ? "mb-6 break-inside-avoid" : "mb-6"}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <Link href={`/projects/${slug}`} className="block w-full group">
                    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full'
                      }`}>
                        {mainImage && mainImage.asset && mainImage.asset.url ? (
                          <Image
                            src={mainImage.asset.url}
                            alt={`${project.title} - ${project.client.name} project showcase`}
                            width={viewMode === 'list' ? 256 : width}
                            height={viewMode === 'list' ? 192 : height}
                            quality={85} // Reduced from 90 for better performance
                            className={`object-cover ${
                              viewMode === 'list' ? 'w-full h-48' : 'w-full h-auto'
                            }`}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            sizes={viewMode === 'list' ? '256px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                            priority={false} // Only hero images should have priority
                          />
                        ) : (
                          <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${
                            viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'
                          }`}>
                            <span className="text-gray-500">{t("Projects.project.noImage")}</span>
                          </div>
                        )}
                        {project.featured && (
                          <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {t("Projects.filters.featured")}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''} ${isRTL ? 'text-right' : ''}`}>
                        <h3 className="text-sm font-semibold mb-2 text-lochmara-600 uppercase tracking-wide">
                          / {project.client.name}
                        </h3>
                        <h3 className={`font-bold mb-3 group-hover:text-lochmara-600 transition-colors ${
                          viewMode === 'list' ? 'text-lg' : 'text-xl'
                        }`}>
                          {project.title}
                        </h3>
                        <p className={`text-gray-600 leading-relaxed ${
                          viewMode === 'list' ? 'line-clamp-2 text-sm' : 'line-clamp-3'
                        }`}>
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Enhanced Header with Search and Controls */}
      <div className="mb-8">
        {/* Main Navigation */}
        <div className={`flex flex-wrap gap-8 mb-6 items-center ${isRTL ? 'justify-center md:justify-end' : 'justify-center md:justify-start'}`}>
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-2xl md:text-4xl font-bold transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-black text-black"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
                <span className={`text-lg ${isRTL ? 'mr-2' : 'ml-2'}`}>({tab.count})</span>
              </motion.button>
              {index < tabs.length - 1 && (
                <span className="text-gray-300 text-2xl md:text-4xl font-light">/</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Search and Controls */}
        <div className={`flex flex-col md:flex-row gap-4 items-stretch md:items-center ${isRTL ? 'md:flex-row-reverse' : ''} justify-between`}>
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={activeTab === "projects" ? t("Projects.filters.search") : t("Projects.filters.searchClients")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lochmara-500 focus:border-transparent transition-all ${
                isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
              }`}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-lochmara-500 text-white' 
                    : 'text-gray-600 hover:text-lochmara-500'
                }`}
                title={t("Projects.filters.viewGrid")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-lochmara-500 text-white' 
                    : 'text-gray-600 hover:text-lochmara-500'
                }`}
                title={t("Projects.filters.viewList")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all ${
                showFilters
                  ? 'bg-lochmara-500 text-white border-lochmara-500'
                  : 'bg-white/50 text-gray-600 border-gray-200 hover:border-lochmara-500'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white/30 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
              <h4 className={`text-lg font-semibold mb-4 text-gray-800 ${isRTL ? 'text-right' : ''}`}>{t("Projects.filters.filters")}</h4>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {filterCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      activeCategory === category.id
                        ? "bg-lochmara-500 text-white border-lochmara-500"
                        : "bg-white/70 text-gray-700 border-gray-200 hover:border-lochmara-500 hover:text-lochmara-500"
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                    <span className={`text-sm opacity-75 ${isRTL ? 'mr-2' : 'ml-2'}`}>({category.count})</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
        <p className="text-gray-600">
          {filteredData.length} {activeTab === "projects" ? t("Projects.filters.projects") : t("Projects.filters.clients")}
          {searchQuery && ` matching "${searchQuery}"`}
          {activeCategory !== "all" && ` in ${activeCategory}`}
        </p>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default ProjectHero;