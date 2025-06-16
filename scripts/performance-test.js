#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance testing script for Navix Agency
console.log('🚀 Starting Navix Performance Analysis...\n');

const testUrls = [
  'http://localhost:3000/en',
  'http://localhost:3000/fr', 
  'http://localhost:3000/ar',
  'http://localhost:3000/en/about',
  'http://localhost:3000/en/projects',
  'http://localhost:3000/en/services'
];

async function runPerformanceTests() {
  const results = [];
  
  for (const url of testUrls) {
    console.log(`📊 Testing: ${url}`);
    
    try {
      const outputPath = `./reports/lighthouse-${url.split('/').pop() || 'home'}.json`;
      
      // Create reports directory if it doesn't exist
      if (!fs.existsSync('./reports')) {
        fs.mkdirSync('./reports');
      }
      
      // Run Lighthouse test
      execSync(`lighthouse "${url}" --output=json --output-path="${outputPath}" --chrome-flags="--headless" --quiet`, {
        stdio: 'inherit'
      });
      
      // Read and parse results
      const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      
      results.push({
        url,
        performance: Math.round(report.lhr.categories.performance.score * 100),
        accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
        seo: Math.round(report.lhr.categories.seo.score * 100),
        fcp: report.lhr.audits['first-contentful-paint'].displayValue,
        lcp: report.lhr.audits['largest-contentful-paint'].displayValue,
        cls: report.lhr.audits['cumulative-layout-shift'].displayValue
      });
      
      console.log(`✅ Completed: ${url}\n`);
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
      results.push({
        url,
        error: error.message
      });
    }
  }
  
  // Generate summary report
  console.log('\n📈 PERFORMANCE SUMMARY');
  console.log('========================');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.url}: ERROR - ${result.error}`);
    } else {
      console.log(`📊 ${result.url}:`);
      console.log(`   Performance: ${result.performance}/100`);
      console.log(`   Accessibility: ${result.accessibility}/100`);
      console.log(`   Best Practices: ${result.bestPractices}/100`);
      console.log(`   SEO: ${result.seo}/100`);
      console.log(`   FCP: ${result.fcp} | LCP: ${result.lcp} | CLS: ${result.cls}`);
      console.log('');
    }
  });
  
  // Save detailed report
  fs.writeFileSync('./reports/summary.json', JSON.stringify(results, null, 2));
  console.log('💾 Detailed report saved to ./reports/summary.json');
}

if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests };