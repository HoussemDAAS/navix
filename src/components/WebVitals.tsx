"use client";

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Define proper types for metrics
interface Metric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

// Send vitals to Google Analytics or your analytics service
function sendToGoogleAnalytics(metric: Metric) {
  // Replace with your Google Analytics measurement ID
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as typeof window & { 
      gtag: (command: string, eventName: string, parameters?: Record<string, unknown>) => void 
    }).gtag;
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export default function WebVitals() {
  useEffect(() => {
    // Track Core Web Vitals with the correct API
    onCLS(sendToGoogleAnalytics);
    onFCP(sendToGoogleAnalytics);
    onLCP(sendToGoogleAnalytics);
    onTTFB(sendToGoogleAnalytics);
    onINP(sendToGoogleAnalytics); // INP replaced FID in newer versions
  }, []);

  return null;
}