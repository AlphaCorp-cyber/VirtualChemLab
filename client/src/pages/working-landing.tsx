import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Experiment {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  features: string[];
  available: boolean;
}

const experiments: Experiment[] = [
  {
    id: "ph-testing",
    title: "pH Testing Lab",
    description: "Learn about acids and bases using virtual pH test strips and indicator solutions.",
    duration: "15-20 minutes",
    difficulty: "Beginner",
    category: "Acid-Base Chemistry",
    features: ["Hand Tracking", "Color-Changing Chemistry", "Real pH Values"],
    available: true
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    description: "Master titration techniques with virtual burettes and pH indicators.",
    duration: "25-30 minutes", 
    difficulty: "Intermediate",
    category: "Quantitative Analysis",
    features: ["Precision Instruments", "Real-time Calculations", "Safety Protocols"],
    available: false
  },
  {
    id: "molecular-modeling",
    title: "3D Molecular Modeling",
    description: "Build and visualize molecular structures in virtual reality space.",
    duration: "20-25 minutes",
    difficulty: "Intermediate", 
    category: "Molecular Chemistry",
    features: ["3D Manipulation", "Bond Visualization", "Molecular Properties"],
    available: false
  },
  {
    id: "spectroscopy",
    title: "Virtual Spectroscopy",
    description: "Analyze chemical compounds using virtual spectroscopy instruments.",
    duration: "30-35 minutes",
    difficulty: "Advanced",
    category: "Analytical Chemistry", 
    features: ["Multiple Techniques", "Data Analysis", "Sample Identification"],
    available: false
  }
];

export default function WorkingLanding() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showExperiments, setShowExperiments] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleExperimentSelect = (experimentId: string) => {
    navigate(`/lab/${experimentId}`);
  };

  const handleChooseYourExperiment = () => {
    setShowExperiments(true);
  };

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-white mb-4">ChemiQ</h1>
          <p className="text-xl text-gray-400">Loading Virtual Reality Chemistry Lab...</p>
        </div>
      </div>
    );
  }

  if (showExperiments) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header with Back Button */}
        <header className="py-8 px-6 border-b border-gray-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowExperiments(false)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">←</span>
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-white">ChemiQ</h1>
            <div className="w-24"></div>
          </div>
        </header>

        {/* Experiments Grid */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white mb-4">Choose Your Experiment</h2>
              <p className="text-xl text-gray-400">Select from our collection of virtual chemistry experiments</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {experiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className={`bg-gray-900 border-2 rounded-xl p-8 transition-all duration-300 ${
                    experiment.available 
                      ? 'border-gray-700 hover:border-white hover:bg-gray-800 cursor-pointer transform hover:scale-105' 
                      : 'border-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => experiment.available && handleExperimentSelect(experiment.id)}
                >
                  {/* Experiment Icon */}
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-black text-3xl">
                      {experiment.id === 'ph-testing' ? '🧪' : 
                       experiment.id === 'titration' ? '⚗️' :
                       experiment.id === 'molecular-modeling' ? '🔬' : '📊'}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-center gap-2 mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      experiment.difficulty === 'Beginner' ? 'bg-green-900 text-green-200' :
                      experiment.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {experiment.difficulty}
                    </span>
                    {!experiment.available && (
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-700 text-gray-400">
                        Coming Soon
                      </span>
                    )}
                    {experiment.available && (
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-900 text-blue-200">
                        Available Now
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white text-center mb-4">{experiment.title}</h3>
                  <p className="text-gray-400 text-center mb-6 leading-relaxed">
                    {experiment.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-medium">{experiment.duration}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white font-medium">{experiment.category}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-3">Key Features:</p>
                    <div className="space-y-2">
                      {experiment.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {experiment.available ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExperimentSelect(experiment.id);
                      }}
                      className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                      Start Experiment
                    </button>
                  ) : (
                    <div className="w-full bg-gray-800 text-gray-500 py-3 rounded-lg font-bold text-center">
                      Coming Soon
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-12">
              <p className="text-gray-400 mb-4">
                More experiments are being developed. Check back soon for updates!
              </p>
              <button
                onClick={() => setShowExperiments(false)}
                className="text-white hover:text-gray-300 underline"
              >
                Return to Main Page
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-8xl font-bold text-white mb-6">ChemiQ</h1>
          <h2 className="text-4xl font-light mb-8 text-gray-200">
            Virtual Reality Chemistry Laboratory
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Immerse yourself in a safe, interactive chemistry laboratory where you can conduct 
            real experiments using natural hand movements. No controllers required.
          </p>
          <button
            onClick={handleChooseYourExperiment}
            className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Choose Your Experiment
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12 text-white">Why Choose ChemiQ?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl">🧪</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Safe Environment</h4>
              <p className="text-gray-400">
                Conduct dangerous experiments safely in virtual reality without risk of injury or chemical exposure.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl">👋</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Natural Interactions</h4>
              <p className="text-gray-400">
                Use your hands naturally to pick up equipment, mix solutions, and conduct experiments just like in a real lab.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl">⚗️</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Real Chemistry</h4>
              <p className="text-gray-400">
                Experience authentic chemical reactions with accurate pH values, color changes, and scientific principles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}