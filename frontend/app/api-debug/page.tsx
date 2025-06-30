"use client";
import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ApiDebugPage() {
  const [result, setResult] = useState<string>('');

  const testApiCall = async () => {
    try {
      setResult('Testing raw API call...');
      
      // Get the token
      const token = localStorage.getItem('access_token');
      console.log('Current token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setResult('ERROR: No access token found. Please login first.');
        return;
      }
      
      // Test raw fetch call to profile endpoint
      const url = 'http://192.168.54.83:8000/api/v1/auth/profile';
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: "Test Update"
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      setResult(`
Raw API Test Results:
Status: ${response.status}
Success: ${response.ok}

Response Headers:
${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}

Response Body:
${JSON.stringify(responseData, null, 2)}
      `);
      
    } catch (error: any) {
      console.error('Raw API test error:', error);
      setResult(`Raw API Error: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    setResult(`
Token Status:
Access Token: ${token ? 'Present' : 'Missing'}
Refresh Token: ${refreshToken ? 'Present' : 'Missing'}
Is Authenticated: ${isAuth}

Access Token (first 50 chars): ${token ? token.substring(0, 50) + '...' : 'N/A'}
    `);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Debug Tool</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={checkToken}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Check Auth Tokens
        </button>
        
        <button 
          onClick={testApiCall}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Test Raw API Call
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded min-h-[400px]">
        <h2 className="font-bold mb-2">Debug Output:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  );
}
