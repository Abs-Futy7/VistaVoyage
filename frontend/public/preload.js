// Critical resource preloader
const preloadCriticalResources = () => {
  // Preload critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/globals.css';
  document.head.appendChild(link);

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.href = '/fonts/inter.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload hero image
  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.as = 'image';
  heroImageLink.href = '/images/bg1.jpg';
  document.head.appendChild(heroImageLink);
};

// DNS prefetch for external domains
const prefetchDNS = () => {
  const domains = [
    'localhost:8000', // API server
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Initialize preloading
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      prefetchDNS();
    });
  } else {
    preloadCriticalResources();
    prefetchDNS();
  }
}
