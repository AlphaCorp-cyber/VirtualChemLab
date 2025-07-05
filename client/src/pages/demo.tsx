
import React, { useState, useEffect } from 'react';
import { DemoRecorder } from '../components/DemoRecorder';

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading and check for required dependencies
    const timer = setTimeout(() => {
      try {
        // Check if required components are available
        if (typeof DemoRecorder === 'undefined') {
          throw new Error('DemoRecorder component is not available');
        }
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDemoComplete = (videoBlob: Blob) => {
    console.log('Demo video recorded successfully!', videoBlob);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading Demo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Demo Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Paper Chromatography Demo</h1>
          <p className="text-xl text-gray-300">
            Automated demonstration of the paper chromatography experiment
          </p>
        </div>
        
        <DemoRecorder onComplete={handleDemoComplete} />
        
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">About This Demo</h2>
          <div className="max-w-4xl mx-auto text-gray-300">
            <p className="mb-4">
              This demo automatically runs through the complete paper chromatography experiment:
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Experiment Steps:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Setup and introduction</li>
                  <li>Select ink type (black, blue, or red)</li>
                  <li>Apply ink to baseline</li>
                  <li>Start chromatography process</li>
                  <li>Watch pigment separation</li>
                  <li>Analyze results</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Realistic 3D lab environment</li>
                  <li>Scientific accuracy</li>
                  <li>Interactive controls</li>
                  <li>Real-time animations</li>
                  <li>Educational annotations</li>
                  <li>Professional recording quality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
