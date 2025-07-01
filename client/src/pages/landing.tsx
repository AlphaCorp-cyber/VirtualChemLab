import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

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
    description: "Learn about acids and bases by testing different solutions with pH indicator strips. Conduct hands-on experiments in a realistic 3D chemistry laboratory.",
    duration: "15-20 minutes",
    difficulty: "Beginner",
    category: "Chemistry",
    features: [
      "Interactive 3D lab environment",
      "VR hand tracking support",
      "Real-time pH color changes",
      "Multiple solution types",
      "Progress tracking"
    ],
    available: true
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    description: "Master the technique of titration to determine unknown concentrations of acids and bases.",
    duration: "25-30 minutes",
    difficulty: "Intermediate",
    category: "Chemistry",
    features: [
      "Burette and pipette handling",
      "Indicator color changes",
      "Precise volume measurements"
    ],
    available: false
  },
  {
    id: "organic-synthesis",
    title: "Organic Synthesis Lab",
    description: "Learn basic organic chemistry reactions and synthesis techniques in a safe virtual environment.",
    duration: "30-45 minutes",
    difficulty: "Advanced",
    category: "Organic Chemistry",
    features: [
      "Reaction mechanisms",
      "Safety protocols",
      "Product isolation"
    ],
    available: false
  }
];

const difficultyColors = {
  "Beginner": "bg-green-100 text-green-800",
  "Intermediate": "bg-yellow-100 text-yellow-800",
  "Advanced": "bg-red-100 text-red-800"
};

export default function Landing() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(experiments.map(exp => exp.category)))];
  const filteredExperiments = selectedCategory === "All" 
    ? experiments 
    : experiments.filter(exp => exp.category === selectedCategory);

  const handleStartExperiment = (experimentId: string) => {
    if (experimentId === "ph-testing") {
      navigate("/lab");
    } else {
      // For future experiments, navigate to specific routes
      navigate(`/lab/${experimentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Virtual Chemistry Lab
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive experiments for hands-on learning
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                VR Ready
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Safe Learning
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Choose Your Experiment
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((experiment) => (
            <Card 
              key={experiment.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                !experiment.available ? 'opacity-60' : 'hover:scale-105'
              }`}
            >
              {!experiment.available && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {experiment.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Badge 
                    className={difficultyColors[experiment.difficulty]}
                    variant="secondary"
                  >
                    {experiment.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {experiment.duration}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Key Features:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {experiment.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleStartExperiment(experiment.id)}
                    disabled={!experiment.available}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {experiment.available ? "Start Experiment" : "Coming Soon"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥽</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">VR Compatible</h3>
              <p className="text-sm text-gray-600">
                Use your hands naturally in VR to interact with lab equipment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe Learning</h3>
              <p className="text-sm text-gray-600">
                Practice dangerous experiments safely in a virtual environment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor your learning progress and experiment results
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}