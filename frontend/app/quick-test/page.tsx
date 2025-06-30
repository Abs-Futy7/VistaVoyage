"use client";
import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function QuickTestPage() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult('Testing connection...');
    
    try {
      const testResult = await apiClient.testConnection();
      
      let resultText = `Connection Test Result:\n`;
      resultText += `Status: ${testResult.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
      resultText += `Message: ${testResult.message}\n\n`;
      resultText += 'Details:\n';
      testResult.details.forEach(detail => {
        resultText += `  ${detail}\n`;
      });
      
      setResult(resultText);
    } catch (error: any) {
      setResult(`Error during test: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult('Testing login endpoint...');
    
    try {
      const response = await apiClient.post('/auth/login', {
        email: 'user@example.com',
        password: 'password'
      });
      
      setResult(`Login Test Result:\n✅ SUCCESS\nResponse: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`Login Test Result:\n❌ FAILED\nError: ${error.message}\nDetails: ${JSON.stringify(error.errors || [], null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quick API Test</h1>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button 
            onClick={testLogin}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {isLoading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result || 'Click a test button to begin...'}</pre>
        </div>
        
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure your FastAPI server is running</li>
            <li>Check if you can access: <code className="bg-gray-200 px-1 rounded">http://192.168.54.83:8000</code> in your browser</li>
            <li>Verify your .env.local file has the correct API URL</li>
            <li>Check that CORS is configured in your FastAPI server</li>
            <li>Try using localhost instead of IP address if running locally</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
