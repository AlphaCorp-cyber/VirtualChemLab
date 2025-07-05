
import React from 'react';
import { DemoRecorder } from '../components/DemoRecorder';

export default function DemoPage() {
  const handleDemoComplete = (videoBlob: Blob) => {
    console.log('Demo video recorded successfully!', videoBlob);
  };

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
