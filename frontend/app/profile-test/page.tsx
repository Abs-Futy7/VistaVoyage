import { useState } from 'react';
import { authService } from '@/lib/api';

export default function ProfileTestPage() {
  const [result, setResult] = useState<string>('');

  const testProfileUpdate = async () => {
    try {
      setResult('Testing profile update...');
      
      // Test with minimal data first
      const testData = {
        full_name: "John Doe Updated"
      };
      
      console.log('Sending data:', testData);
      
      const updatedUser = await authService.updateProfile(testData);
      setResult(`Success: ${JSON.stringify(updatedUser, null, 2)}`);
    } catch (error: any) {
      console.error('Test error:', error);
      setResult(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile Update Test</h1>
      <button 
        onClick={testProfileUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Profile Update
      </button>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
}
