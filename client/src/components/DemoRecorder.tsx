
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import PaperChromatographyLab from './PaperChromatographyLab';
import { LabEnvironment } from './LabEnvironment';
import { useChemistryLab } from '../lib/stores/useChemistryLab';

// Error boundary component
class DemoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Demo error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="demo-error p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-semibold text-red-800">Demo Error</h3>
          <p className="text-red-600">
            There was an error loading the demo. Please refresh the page and try again.
          </p>
          <details className="mt-2">
            <summary className="text-sm text-red-500 cursor-pointer">Error Details</summary>
            <pre className="text-xs text-red-500 mt-1 overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

interface DemoRecorderProps {
  onComplete?: (videoBlob: Blob) => void;
}

export const DemoRecorder: React.FC<DemoRecorderProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStep, setRecordingStep] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordedChunks = useRef<Blob[]>([]);
  
  const { resetState } = useChemistryLab();

  const demoSteps = [
    { duration: 3000, description: "Introduction - Paper Chromatography Setup" },
    { duration: 2000, description: "Select black ink" },
    { duration: 2000, description: "Apply ink to baseline" },
    { duration: 3000, description: "Start chromatography process" },
    { duration: 8000, description: "Watch pigment separation" },
    { duration: 3000, description: "Observe final results" },
    { duration: 2000, description: "Demo complete" }
  ];

  useEffect(() => {
    if (isRecording && recordingStep < demoSteps.length) {
      const timer = setTimeout(() => {
        setRecordingStep(prev => prev + 1);
      }, demoSteps[recordingStep].duration);

      return () => clearTimeout(timer);
    } else if (isRecording && recordingStep >= demoSteps.length) {
      stopRecording();
    }
  }, [isRecording, recordingStep]);

  const startRecording = async () => {
    try {
      resetState();
      setRecordingStep(0);
      recordedChunks.current = [];

      // Check if screen recording is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen recording is not supported in this browser. The demo will run without recording.');
        setIsRecording(true);
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' as any },
        audio: false
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        onComplete?.(blob);
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'paper-chromatography-demo.webm';
        a.click();
        URL.revokeObjectURL(url);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Recording failed, but demo will continue. Error: ' + error.message);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Auto-simulate experiment steps
  const getCurrentStepAction = () => {
    switch (recordingStep) {
      case 1: // Select black ink
        return () => {
          const blackInk = document.querySelector('[data-ink="black"]') as HTMLElement;
          blackInk?.click();
        };
      case 2: // Apply ink
        return () => {
          const applyButton = document.querySelector('[data-action="apply-ink"]') as HTMLElement;
          applyButton?.click();
        };
      case 3: // Start chromatography
        return () => {
          const startButton = document.querySelector('[data-action="start-chromatography"]') as HTMLElement;
          startButton?.click();
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    if (isRecording) {
      const action = getCurrentStepAction();
      if (action) {
        setTimeout(action, 500);
      }
    }
  }, [recordingStep, isRecording]);

  return (
    <div className="demo-recorder">
      <div className="controls mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRecording ? 'Recording...' : 'Start Demo Recording'}
        </button>
        
        {isRecording && (
          <button
            onClick={stopRecording}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="recording-status mb-4 p-4 bg-gray-100 rounded">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="font-semibold">Recording in progress...</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Step {recordingStep + 1}/{demoSteps.length}: {demoSteps[recordingStep]?.description}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((recordingStep + 1) / demoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="demo-canvas-container" style={{ width: '100%', height: '600px' }}>
        <DemoErrorBoundary>
          <Canvas ref={canvasRef} shadows>
            <PerspectiveCamera makeDefault position={[0, 2, 4]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={isRecording}
              autoRotateSpeed={0.5}
            />
            
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            
            <LabEnvironment />
            
            <group position={[0, 0, 0]}>
              <PaperChromatographyLab 
                onExperimentComplete={(result) => {
                  console.log('Demo experiment completed:', result);
                }}
              />
            </group>
            
            <Environment preset="laboratory" />
          </Canvas>
        </DemoErrorBoundary>
      </div>

      <div className="demo-info mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Demo Video Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Automatic camera rotation for best viewing angles</li>
          <li>• Step-by-step experiment simulation</li>
          <li>• Real-time pigment separation animation</li>
          <li>• Professional lab environment</li>
          <li>• Educational annotations and results</li>
        </ul>
      </div>
    </div>
  );
};
