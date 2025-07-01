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

export default function SimpleLanding() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simple fade-in effect
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleExperimentSelect = (experimentId: string) => {
    navigate(`/lab/${experimentId}`);
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-8xl font-bold text-white mb-6">ChemiQ</h1>
          <h2 className="text-4xl font-light mb-8 text-gray-200">
            Virtual Reality Chemistry Laboratory
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in a safe, interactive chemistry laboratory where you can conduct 
            real experiments using natural hand movements. No controllers required.
          </p>
        </div>
      </header>

      {/* Experiments Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            Choose Your Experiment
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className={`bg-gray-900 border border-gray-700 rounded-lg p-6 transition-all duration-300 hover:border-white hover:bg-gray-800 ${
                  experiment.available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => experiment.available && handleExperimentSelect(experiment.id)}
              >
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    experiment.difficulty === 'Beginner' ? 'bg-green-900 text-green-200' :
                    experiment.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {experiment.difficulty}
                  </span>
                  {!experiment.available && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Coming Soon
                    </span>
                  )}
                </div>
                
                <h4 className="text-xl font-bold mb-3 text-white">{experiment.title}</h4>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {experiment.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Duration:</span>
                    <span>{experiment.duration}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Category:</span>
                    <span>{experiment.category}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {experiment.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Call to Action */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-white">Ready to Start Learning?</h3>
          <p className="text-xl text-gray-400 mb-8">
            Put on your VR headset and step into the future of chemistry education.
          </p>
          <button
            onClick={() => handleExperimentSelect("ph-testing")}
            className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Start pH Testing Lab
          </button>
        </div>
      </section>
    </div>
  );
}