"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { runDiagnostics, ConnectionTester } from '@/lib/api/diagnostics';
import { API_CONFIG } from '@/lib/api/config';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details: string[];
}

interface EndpointResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'not_found';
  message: string;
}

export default function ApiTestPage() {
  const [connectionResult, setConnectionResult] = useState<DiagnosticResult | null>(null);
  const [endpointResults, setEndpointResults] = useState<EndpointResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    
    try {
      // Test connection
      const connTest = await ConnectionTester.testConnection();
      setConnectionResult(connTest);
      
      // Test endpoints if connection successful
      if (connTest.success) {
        const endpointTest = await ConnectionTester.testEndpoints();
        setEndpointResults(endpointTest.results);
      } else {
        setEndpointResults([]);
      }
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runConsoleDiagnostics = () => {
    runDiagnostics();
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'not_found':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'not_found':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Not Found</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">API Connection Test</h1>
          <p className="text-gray-600">
            Test your connection to the FastAPI backend
          </p>
          <p className="text-sm text-gray-500">
            API URL: <code className="bg-gray-100 px-2 py-1 rounded">{API_CONFIG.BASE_URL}</code>
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={runTests} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testing...' : 'Run Tests'}
          </Button>
          <Button variant="outline" onClick={runConsoleDiagnostics}>
            Run Console Diagnostics
          </Button>
        </div>

        {/* Connection Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionResult ? (
                connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              ) : (
                <RefreshCw className="h-5 w-5 text-gray-400" />
              )}
              Connection Test
            </CardTitle>
            <CardDescription>
              Test basic connectivity to the FastAPI server
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(connectionResult.success ? 'success' : 'error')}
                  <span className="text-sm text-gray-600">{connectionResult.message}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Details:</span>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {connectionResult.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-xs">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Click "Run Tests" to test connection</p>
            )}
          </CardContent>
        </Card>

        {/* Endpoint Test Results */}
        {endpointResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Tests</CardTitle>
              <CardDescription>
                Check if required API endpoints are available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpointResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <span className="font-medium">{result.method}</span>
                        <span className="text-gray-600 ml-2">{result.endpoint}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="text-sm text-gray-600">{result.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
            <CardDescription>
              Common solutions for connection issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Check FastAPI Server</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Ensure FastAPI is running: <code className="bg-gray-100 px-1 rounded">uvicorn main:app --reload</code></li>
                  <li>• Server should be accessible at: <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code></li>
                  <li>• Check server logs for errors</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. CORS Configuration</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Add CORS middleware to FastAPI</li>
                  <li>• Allow origin: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
                  <li>• Enable credentials if using authentication</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Environment Variables</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check <code className="bg-gray-100 px-1 rounded">.env.local</code> file</li>
                  <li>• Verify <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> is set correctly</li>
                  <li>• Restart Next.js dev server after changes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">4. Network Issues</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check firewall settings</li>
                  <li>• Verify port 8000 is not blocked</li>
                  <li>• Try accessing API directly in browser</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
