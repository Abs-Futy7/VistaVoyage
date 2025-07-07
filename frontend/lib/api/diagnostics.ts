// API Connection Testing Utility
import { API_CONFIG } from './config';

export class ConnectionTester {
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details: string[];
  }> {
    const details: string[] = [];
    
    try {
      // Test basic connectivity
      details.push('Testing connection to FastAPI server...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        details.push(`✅ Connected to ${API_CONFIG.BASE_URL}`);
        details.push(`✅ Status: ${response.status} ${response.statusText}`);
        return {
          success: true,
          message: 'Connection successful',
          details
        };
      } else {
        details.push(`❌ Server responded with status: ${response.status}`);
        details.push(`❌ Status text: ${response.statusText}`);
        return {
          success: false,
          message: 'Server error',
          details
        };
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        details.push('❌ Connection timeout (5 seconds)');
        details.push('Check if FastAPI server is running');
      } else if (error.message.includes('Failed to fetch')) {
        details.push('❌ Network error - Cannot reach server');
        details.push('Possible causes:');
        details.push('  • FastAPI server is not running');
        details.push('  • Wrong API URL in environment variables');
        details.push('  • CORS configuration issues');
        details.push('  • Firewall blocking the connection');
      } else {
        details.push(`❌ Unexpected error: ${error.message}`);
      }
      
      return {
        success: false,
        message: 'Connection failed',
        details
      };
    }
  }

  static async testEndpoints(): Promise<{
    success: boolean;
    results: Array<{
      endpoint: string;
      method: string;
      status: 'success' | 'error' | 'not_found';
      message: string;
    }>;
  }> {
    const endpoints = [
      { path: '/auth/login', method: 'POST' },
      { path: '/auth/register', method: 'POST' },
      { path: '/packages', method: 'GET' },
      { path: '/destinations', method: 'GET' },
    ];

    const results = [];
    let overallSuccess = true;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint.path}`, {
          method: 'OPTIONS', // Use OPTIONS to check if endpoint exists
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok || response.status === 405) {
          // 405 Method Not Allowed means endpoint exists but doesn't support OPTIONS
          results.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'success' as const,
            message: 'Endpoint available'
          });
        } else if (response.status === 404) {
          results.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'not_found' as const,
            message: 'Endpoint not implemented'
          });
          overallSuccess = false;
        } else {
          results.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'error' as const,
            message: `Status: ${response.status}`
          });
          overallSuccess = false;
        }        } catch (error: any) {
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 'error' as const,
          message: error.message || 'Connection failed'
        });
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      results
    };
  }
}

// Helper function to run full diagnostics
export async function runDiagnostics(): Promise<void> {
  console.log('🔍 Running API Connection Diagnostics...\n');
  
  // Test basic connection
  const connectionTest = await ConnectionTester.testConnection();
  console.log('📡 Connection Test:');
  console.log(`Status: ${connectionTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Message: ${connectionTest.message}`);
  connectionTest.details.forEach(detail => console.log(`  ${detail}`));
  console.log('\n');

  if (connectionTest.success) {
    // Test endpoints
    const endpointTest = await ConnectionTester.testEndpoints();
    console.log('🔗 Endpoint Test:');
    console.log(`Overall Status: ${endpointTest.success ? '✅ PASS' : '⚠️ PARTIAL'}`);
    endpointTest.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'not_found' ? '⚠️' : '❌';
      console.log(`  ${icon} ${result.method} ${result.endpoint} - ${result.message}`);
    });
  }

  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Ensure FastAPI server is running: uvicorn main:app --reload');
  console.log('2. Check server is accessible at: http://localhost:8000');
  console.log('3. Verify CORS configuration in FastAPI');
  console.log('4. Check environment variables in .env.local');
}
