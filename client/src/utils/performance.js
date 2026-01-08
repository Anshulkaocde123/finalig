// Performance Monitoring Utility
// Tracks Core Web Vitals in production

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export const initPerformanceMonitoring = () => {
  const reportMetric = ({ name, value, rating }) => {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`[Performance] ${emoji} ${name}: ${Math.round(value)}ms (${rating})`);
    
    // Optional: Send to analytics endpoint
    // if (import.meta.env.PROD) {
    //   fetch('/api/analytics/performance', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //       metric: name, 
    //       value: Math.round(value), 
    //       rating,
    //       timestamp: Date.now(),
    //       page: window.location.pathname
    //     })
    //   }).catch(() => {});
    // }
  };

  // Track all Core Web Vitals (updated to v4 API)
  onCLS(reportMetric);  // Cumulative Layout Shift
  onINP(reportMetric);  // Interaction to Next Paint (replaces FID)
  onFCP(reportMetric);  // First Contentful Paint
  onLCP(reportMetric);  // Largest Contentful Paint
  onTTFB(reportMetric); // Time to First Byte

  console.log('🎯 Performance monitoring initialized');
};

// Track navigation timing
export const getNavigationMetrics = () => {
  if (!window.performance) return null;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  return {
    pageLoadTime,
    connectTime,
    renderTime,
  };
};

// Track resource loading
export const getResourceMetrics = () => {
  if (!window.performance) return [];

  const resources = performance.getEntriesByType('resource');
  return resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: Math.round(resource.duration),
    size: resource.transferSize || 0,
  }));
};

export default {
  initPerformanceMonitoring,
  getNavigationMetrics,
  getResourceMetrics,
};
