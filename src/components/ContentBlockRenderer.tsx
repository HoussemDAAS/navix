/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { 
  VideoBlock, 
  GalleryBlock, 
  MetricsBlock, 
  UIBlock, 
  BrandBlock,
  ContentBlock 
} from '@/sanity/schemaTypes/ProjectType';
import { 
  FaVideo, 
  FaImage, 
  FaChartLine, 
  FaMobile, 
  FaBrush, 
  FaExternalLinkAlt,
  FaPlay,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';
import InstagramEmbed from '@/components/InstagramEmbed';

interface ContentBlockRendererProps {
  block: ContentBlock;
  translations: {
    contentBlocks: {
      videoShowcase: string;
      imageGallery: string;
      keyResults: string;
      uiShowcase: string;
      viewPrototype: string;
      brandAssets: string;
      viewStyleGuide: string;
    };
  };
  locale?: string;
}


// Enhanced Device Frame Component with Realistic Designs
const DeviceFrame: React.FC<{ 
  children: React.ReactNode; 
  type: 'mobile' | 'desktop' | 'tablet';
  className?: string;
}> = ({ children, type, className = '' }) => {
  const frames = {
    mobile: (
      <div className={`relative mx-auto ${className}`} style={{ width: '280px' }}>
        {/* iPhone-style frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="bg-black rounded-[2.5rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="relative bg-black h-8 flex items-center justify-center">
              <div className="w-24 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-700 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
              </div>
            </div>
            {/* Screen */}
            <div className="relative" style={{ aspectRatio: '9/19.5' }}>
              {children}
            </div>
            {/* Home indicator */}
            <div className="bg-black h-6 flex items-center justify-center">
              <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    tablet: (
      <div className={`relative mx-auto ${className}`} style={{ width: '400px' }}>
        {/* iPad-style frame */}
        <div className="relative bg-gray-200 rounded-[2rem] p-4 shadow-2xl">
          <div className="bg-black rounded-[1.5rem] overflow-hidden">
            {/* Camera */}
            <div className="relative bg-black h-6 flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
            </div>
            {/* Screen */}
            <div className="relative bg-white" style={{ aspectRatio: '4/3' }}>
              {children}
            </div>
            {/* Home button area */}
            <div className="bg-black h-6"></div>
          </div>
        </div>
      </div>
    ),
    desktop: (
      <div className={`relative mx-auto ${className}`} style={{ width: '600px' }}>
        {/* MacBook-style frame */}
        <div className="relative">
          {/* Screen */}
          <div className="bg-gray-800 rounded-t-lg p-1 shadow-2xl">
            <div className="bg-gray-700 h-6 rounded-t-md flex items-center px-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <div className="w-32 h-3 bg-gray-600 rounded mx-auto"></div>
              </div>
            </div>
            <div className="bg-white rounded-b-md overflow-hidden">
              <div className="relative" style={{ aspectRatio: '16/10' }}>
                {children}
              </div>
            </div>
          </div>
          {/* Base */}
          <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl mx-8"></div>
        </div>
      </div>
    ),
  };

  return frames[type];
};

// Video Block Component
const VideoBlockRenderer: React.FC<{
  block: VideoBlock;
  translations: ContentBlockRendererProps['translations'];
}> = ({ block, translations }) => {
  const isInstagram = block.url.includes('instagram.com');
  const isVertical = block.orientation === 'vertical';

  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex items-center justify-center w-12 h-12 bg-lochmara-500/10 rounded-xl backdrop-blur-sm">
            <FaVideo className="text-lochmara-600 text-lg" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            {translations.contentBlocks.videoShowcase}
          </h2>
        </div>

        {/* Video Content */}
        <div className={`max-w-5xl mx-auto ${isVertical ? 'max-w-md' : ''}`}>
          {isInstagram ? (
            <div className="flex justify-center">
              <InstagramEmbed url={block.url} />
            </div>
          ) : (
            <div className="relative group">
              <div className={`relative ${isVertical ? 'aspect-[9/16] max-w-md mx-auto' : 'aspect-video'} 
                              rounded-2xl overflow-hidden bg-black/10 backdrop-blur-sm 
                              border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500`}>
                <video
                  src={block.url}
                  controls
                  className="w-full h-full object-cover"
                  poster="/images/video-placeholder.jpg"
                />
              </div>
            </div>
          )}
          
          {block.caption && (
            <motion.p 
              className="mt-8 text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {block.caption}
            </motion.p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

// Gallery Block Component with Enhanced Lightbox
const GalleryBlockRenderer: React.FC<{
  block: GalleryBlock;
  translations: ContentBlockRendererProps['translations'];
}> = ({ block, translations }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setCurrentIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % block.images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + block.images.length) % block.images.length);
  };

  const layoutClasses = {
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    carousel: "flex overflow-x-auto gap-8 pb-6 snap-x snap-mandatory",
    fullscreen: "space-y-12"
  };

  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex items-center justify-center w-12 h-12 bg-lochmara-500/10 rounded-xl">
            <FaImage className="text-lochmara-600 text-lg" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            {translations.contentBlocks.imageGallery}
          </h2>
        </div>

        {/* Gallery Content */}
        <div className={layoutClasses[block.layout] || layoutClasses.grid}>
          {block.images?.map((image, idx) => (
            <motion.div
              key={idx}
              className={`group cursor-pointer relative snap-start ${
                block.layout === 'carousel' ? 'flex-shrink-0 w-80' : ''
              } ${block.layout === 'fullscreen' ? 'max-w-4xl mx-auto' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              onClick={() => openLightbox(idx)}
            >
              <div className={`relative ${
                block.layout === 'fullscreen' ? 'aspect-[16/9]' : 'aspect-[4/3]'
              } rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm 
                            border border-white/20 shadow-lg group-hover:shadow-xl 
                            transition-all duration-500`}>
                <Image
                  src={urlFor(image).url()}
                  alt={image.alt || `Gallery image ${idx + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <div className="absolute inset-0 bg-lochmara-500/0 group-hover:bg-lochmara-500/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FaExpand className="text-white text-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <div className="relative max-w-7xl max-h-full">
                <Image
                  src={urlFor(block.images[currentIndex]).url()}
                  alt={block.images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Controls with Lochmara colors */}
                <button
                  onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                  className="absolute top-4 right-4 p-3 bg-lochmara-500/20 hover:bg-lochmara-500/30 backdrop-blur-sm rounded-full transition-colors"
                >
                  <FaTimes className="text-white" />
                </button>
                
                {block.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-lochmara-500/20 hover:bg-lochmara-500/30 backdrop-blur-sm rounded-full transition-colors"
                    >
                      <FaChevronLeft className="text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-lochmara-500/20 hover:bg-lochmara-500/30 backdrop-blur-sm rounded-full transition-colors"
                    >
                      <FaChevronRight className="text-white" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

// Enhanced Metrics Block
const MetricsBlockRenderer: React.FC<{
  block: MetricsBlock;
  translations: ContentBlockRendererProps['translations'];
}> = ({ block, translations }) => {
  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex items-center justify-center w-12 h-12 bg-lochmara-500/10 rounded-xl">
            <FaChartLine className="text-lochmara-600 text-lg" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            {block.title || translations.contentBlocks.keyResults}
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {block.metrics?.map((metric, idx) => (
            <motion.div
              key={idx}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
            >
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 
                            rounded-2xl p-8 text-center hover:bg-white/80 dark:hover:bg-gray-800/80 
                            transition-all duration-500 shadow-lg hover:shadow-xl group-hover:-translate-y-1">
                <div className="text-4xl lg:text-5xl font-bold text-lochmara-600 mb-4 
                              group-hover:text-lochmara-700 transition-colors duration-300">
                  {metric.value}
                </div>
                <div className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                  {metric.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Enhanced UI Block with Realistic Device Frames
const UIBlockRenderer: React.FC<{
  block: UIBlock;
  translations: ContentBlockRendererProps['translations'];
}> = ({ block, translations }) => {
  // Auto-detect device type based on image dimensions
  const detectDeviceType = (image: any): 'mobile' | 'desktop' | 'tablet' => {
    const width = image.asset?.metadata?.dimensions?.width || 0;
    const height = image.asset?.metadata?.dimensions?.height || 0;
    const ratio = width / height;
    
    if (ratio < 0.8) return 'mobile'; // Portrait
    if (ratio > 1.4) return 'desktop'; // Wide landscape
    return 'tablet'; // Square-ish
  };

  return (
    <motion.section 
      className="py-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4">
        {/* Enhanced Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-lochmara-500/10 rounded-xl">
              <FaMobile className="text-lochmara-600 text-lg" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              {translations.contentBlocks.uiShowcase}
            </h2>
          </div>
          
          {block.prototype && (
            <Link
              href={block.prototype}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-lochmara-500 hover:bg-lochmara-600 
                        text-white px-6 py-3 rounded-full transition-all duration-300 
                        shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
            >
              <FaPlay className="text-sm" />
              {translations.contentBlocks.viewPrototype}
              <FaExternalLinkAlt className="text-sm" />
            </Link>
          )}
        </div>

        {/* Enhanced Device Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-16 items-center justify-items-center">
          {block.screens?.map((screen, idx) => {
            const deviceType = detectDeviceType(screen);
            
            return (
              <motion.div
                key={idx}
                className="w-full flex justify-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
              >
                <div className="group hover:-translate-y-2 transition-transform duration-500">
                  <DeviceFrame type={deviceType}>
                    <Image
                      src={urlFor(screen).url()}
                      alt={screen.alt || `UI Screen ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </DeviceFrame>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

// Enhanced Brand Block
const BrandBlockRenderer: React.FC<{
  block: BrandBlock;
  translations: ContentBlockRendererProps['translations'];
}> = ({ block, translations }) => {
  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-lochmara-500/10 rounded-xl">
              <FaBrush className="text-lochmara-600 text-lg" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              {translations.contentBlocks.brandAssets}
            </h2>
          </div>
          
          {block.styleGuide && (
            <Link
              href={block.styleGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-lochmara-500 hover:bg-lochmara-600 
                        text-white px-6 py-3 rounded-full transition-all duration-300 
                        shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
            >
              {translations.contentBlocks.viewStyleGuide}
              <FaExternalLinkAlt className="text-sm" />
            </Link>
          )}
        </div>

        {/* Brand Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {block.assets?.map((asset, idx) => (
            <motion.div
              key={idx}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
            >
              <div className="relative aspect-square bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
                            border border-white/20 rounded-2xl p-8 shadow-lg group-hover:shadow-xl 
                            transition-all duration-500 overflow-hidden group-hover:-translate-y-1">
                <Image
                  src={urlFor(asset).url()}
                  alt={asset.alt || `Brand Asset ${idx + 1}`}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Main Content Block Renderer
const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ 
  block, 
  translations
}) => {
  switch (block._type) {
    case "videoBlock":
      return <VideoBlockRenderer block={block} translations={translations} />;
    
    case "galleryBlock":
      return <GalleryBlockRenderer block={block} translations={translations} />;
    
    case "metricsBlock":
      return <MetricsBlockRenderer block={block} translations={translations} />;
    
    case "uiBlock":
      return <UIBlockRenderer block={block} translations={translations} />;
    
    case "brandBlock":
      return <BrandBlockRenderer block={block} translations={translations} />;
    
    default:
      return null;
  }
};

export default ContentBlockRenderer;