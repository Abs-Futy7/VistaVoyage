const { spawn } = require('child_process');
const http = require('http');

const routes = [
  '/',
  '/packages',
  '/destinations',
  '/blogs',
  '/auth/login',
  '/auth/register',
  '/faq',
  '/offers'
];

async function warmupRoute(route) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3002, // Updated to use the correct port
      path: route,
      method: 'GET',
    }, (res) => {
      console.log(`✅ Warmed up: ${route} (${res.statusCode})`);
      resolve();
    });

    req.on('error', () => {
      console.log(`❌ Failed to warm up: ${route}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Timeout warming up: ${route}`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function warmupAllRoutes() {
  console.log('🔥 Starting route warmup...');
  
  // Wait a bit for the server to be ready
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  for (const route of routes) {
    await warmupRoute(route);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🔥 Route warmup complete!');
}

if (require.main === module) {
  warmupAllRoutes().catch(console.error);
}

module.exports = { warmupAllRoutes };
