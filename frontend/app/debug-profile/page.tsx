"use client";
import { useState } from 'react';
import { authService } from '@/lib/api';

export default function DebugProfilePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGetProfile = async () => {
    try {
      setLoading(true);
      setResult('Fetching current profile...');
      
      const profile = await authService.getProfile();
      setResult(`Current Profile:\n${JSON.stringify(profile, null, 2)}`);
    } catch (error: any) {
      console.error('Get profile error:', error);
      setResult(`Get Profile Error:\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    try {
      setLoading(true);
      setResult('Testing profile update...');
      
      // Test with minimal valid data
      const testData = {
        full_name: "Test User"
      };
      
      console.log('Sending data to backend:', testData);
      setResult(`Sending: ${JSON.stringify(testData, null, 2)}\n\nWaiting for response...`);
      
      const updatedProfile = await authService.updateProfile(testData);
      setResult(`Success!\nUpdated Profile:\n${JSON.stringify(updatedProfile, null, 2)}`);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setResult(`Update Error:\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithAllFields = async () => {
    try {
      setLoading(true);
      setResult('Testing with all fields...');
      
      const testData = {
        full_name: "John Doe",
        email: "test@example.com", // 17 chars - under 30 limit
        city: "New York",
        country: "USA",
        phone: "+1234567890",
        passport: "A1234567"
      };
      
      console.log('Sending all fields:', testData);
      setResult(`Sending: ${JSON.stringify(testData, null, 2)}\n\nWaiting for response...`);
      
      const updatedProfile = await authService.updateProfile(testData);
      setResult(`Success!\nUpdated Profile:\n${JSON.stringify(updatedProfile, null, 2)}`);
    } catch (error: any) {
      console.error('Full update error:', error);
      setResult(`Full Update Error:\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Update Debug Tool</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testGetProfile}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          1. Get Current Profile
        </button>
        
        <button 
          onClick={testUpdateProfile}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          2. Test Minimal Update
        </button>
        
        <button 
          onClick={testWithAllFields}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          3. Test All Fields
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded min-h-[400px]">
        <h2 className="font-bold mb-2">Debug Output:</h2>
        {loading && <p className="text-blue-600">Loading...</p>}
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold">Instructions:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>First click "Get Current Profile" to see your data</li>
          <li>Then click "Test Minimal Update" to test with just name</li>
          <li>Finally "Test All Fields" to test with complete data</li>
          <li>Check the browser console for additional details</li>
        </ol>
      </div>
    </div>
  );
}
