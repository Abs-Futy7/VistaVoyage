"use client";

import { useState } from 'react';

export default function RegistrationTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Test direct API call to see raw response
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'testpassword123',
          city: 'Test City',
          country: 'Test Country',
          phone: '+1234567890',
          passport: 'TEST123456'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const data = await response.json();
      console.log('Raw response data:', data);
      
      setResult(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data
      }, null, 2));
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Registration Response Test</h1>
      <button 
        onClick={testRegistration}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Registration Response'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
