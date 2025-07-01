import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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
    title: "pH Testing Laboratory",
    description: "Master acid-base chemistry through immersive pH testing with color-changing indicators and real-time molecular visualization.",
    duration: "15-20 minutes",
    difficulty: "Beginner",
    category: "Acid-Base Chemistry",
    features: ["pH Test Strips", "Color Recognition", "Safety Protocols", "Data Recording"],
    available: true
  },
  {
    id: "titration",
    title: "Acid-Base Titration",
    description: "Perform precise titrations using virtual burettes and indicators to determine unknown concentrations.",
    duration: "25-30 minutes", 
    difficulty: "Intermediate",
    category: "Quantitative Analysis",
    features: ["Burette Control", "Endpoint Detection", "Calculations", "Graph Analysis"],
    available: false
  },
  {
    id: "crystallization",
    title: "Crystal Formation",
    description: "Observe crystal growth patterns and learn about molecular arrangements in solid structures.",
    duration: "20-25 minutes",
    difficulty: "Advanced", 
    category: "Physical Chemistry",
    features: ["Crystal Structures", "Molecular Models", "Temperature Control", "Time-lapse"],
    available: false
  },
  {
    id: "synthesis",
    title: "Organic Synthesis",
    description: "Build complex organic molecules step-by-step with guided synthesis pathways.",
    duration: "30-40 minutes",
    difficulty: "Advanced",
    category: "Organic Chemistry", 
    features: ["Reaction Mechanisms", "3D Molecular Building", "Safety Equipment", "Yield Calculations"],
    available: false
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false); // Skip intro for now to debug
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(() => setShowIntro(false), 1000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const introSteps = [
    "Initializing Virtual Reality Environment...",
    "Loading Chemistry Laboratory Assets...", 
    "Calibrating Hand Tracking Systems...",
    "Welcome to ChemiQ"
  ];

  const handleExperimentSelect = (experimentId: string) => {
    navigate(`/lab/${experimentId}`);
  };

  console.log("Landing page rendering...");
  
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Simple test content */}
      <div className="p-8">
        <h1 className="text-4xl text-white mb-4">ChemiQ - Test</h1>
        <p className="text-white">If you can see this, the page is loading properly.</p>
      </div>
      
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Animated Intro */}
            <div className="text-center">
              {/* ChemiQ Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-8"
              >
                <div className="relative">
                  {/* Main Logo */}
                  <motion.h1 
                    className="text-8xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    ChemiQ
                  </motion.h1>
                  
                  {/* Floating Lab Equipment Around Logo */}
                  <motion.div
                    className="absolute -top-8 -left-8"
                    animate={{ rotate: 360, y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <svg width="32" height="48" viewBox="0 0 32 48" className="text-white opacity-60">
                      <rect x="12" y="8" width="8" height="32" fill="currentColor" opacity="0.3" rx="4"/>
                      <rect x="12" y="25" width="8" height="15" fill="#ffffff" opacity="0.6" rx="4"/>
                      <circle cx="16" cy="32" r="2" fill="#ffffff" opacity="0.8"/>
                    </svg>
                  </motion.div>

                  <motion.div
                    className="absolute -top-4 -right-12"
                    animate={{ rotate: -360, y: [5, -5, 5] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <svg width="40" height="32" viewBox="0 0 40 32" className="text-white opacity-60">
                      <path d="M8 8 L32 8 L30 28 L10 28 Z" fill="currentColor" opacity="0.3" stroke="currentColor"/>
                      <rect x="10" y="16" width="20" height="12" fill="#ffffff" opacity="0.6"/>
                    </svg>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                    animate={{ scale: [0.8, 1.2, 0.8], y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg width="24" height="32" viewBox="0 0 24 32" className="text-white opacity-60">
                      <rect x="10" y="0" width="4" height="12" fill="currentColor" opacity="0.6"/>
                      <path d="M10 12 L4 28 L20 28 Z" fill="currentColor" opacity="0.3"/>
                      <path d="M6 22 L18 22 L16 28 L8 28 Z" fill="#ffffff" opacity="0.6"/>
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Loading Steps */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                {introSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`text-lg ${index <= currentStep ? 'text-white' : 'text-gray-600'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= currentStep ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: index * 0.3 + 2 }}
                  >
                    {index === currentStep && index < 3 && (
                      <motion.span
                        className="inline-block ml-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⚗️
                      </motion.span>
                    )}
                    {step}
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                className="w-64 h-1 bg-gray-800 mx-auto mt-8 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep + 1) * 25}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Landing Page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Lab Equipment */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`equipment-${i}`}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 10, -10, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            >
              {i % 4 === 0 && (
                <svg width="24" height="40" viewBox="0 0 24 40" className="text-white">
                  <rect x="9" y="6" width="6" height="28" fill="currentColor" opacity="0.4" rx="3"/>
                  <rect x="9" y="20" width="6" height="14" fill="currentColor" opacity="0.6" rx="3"/>
                </svg>
              )}
              {i % 4 === 1 && (
                <svg width="32" height="36" viewBox="0 0 32 36" className="text-white">
                  <path d="M6 8 L26 8 L24 32 L8 32 Z" fill="currentColor" opacity="0.3"/>
                  <rect x="8" y="20" width="16" height="12" fill="currentColor" opacity="0.5"/>
                </svg>
              )}
              {i % 4 === 2 && (
                <svg width="28" height="42" viewBox="0 0 28 42" className="text-white">
                  <rect x="12" y="0" width="4" height="18" fill="currentColor" opacity="0.4"/>
                  <path d="M12 18 L4 38 L24 38 Z" fill="currentColor" opacity="0.3"/>
                </svg>
              )}
              {i % 4 === 3 && (
                <div className="w-8 h-8 border border-white opacity-30 rounded flex items-center justify-center text-xs">
                  {['H', 'O', 'C', 'N'][Math.floor(Math.random() * 4)]}
                </div>
              )}
            </motion.div>
          ))}

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>
        </div>

        {/* Header */}
        <motion.header
          className="relative z-10 pt-8 pb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl">
                  Q
                </div>
                <h1 className="text-3xl font-bold">ChemiQ</h1>
              </motion.div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#experiments" className="hover:text-gray-300 transition-colors">Experiments</a>
                <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
                <a href="#about" className="hover:text-gray-300 transition-colors">About</a>
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          className="relative z-10 py-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="container mx-auto px-6">
            <motion.h2
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              Virtual Reality
              <br />
              Chemistry Lab
            </motion.h2>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              Experience hands-on chemistry learning in immersive virtual reality. 
              Conduct real experiments safely with precise hand tracking and realistic molecular interactions.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 rounded-full"
                onClick={() => document.getElementById('experiments')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Choose Your Experiment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4 rounded-full"
              >
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Experiments Selection */}
        <motion.section
          id="experiments"
          className="relative z-10 py-20 bg-gradient-to-b from-transparent to-gray-900/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              <h3 className="text-5xl font-bold mb-6">Choose Your Experiment</h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Select from our carefully designed chemistry experiments. Each one offers 
                a unique hands-on learning experience with real-world applications.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {experiments.map((experiment, index) => (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 + index * 0.1 }}
                >
                  <Card 
                    className={`h-full transition-all duration-300 cursor-pointer ${
                      experiment.available 
                        ? 'bg-gray-900/80 border-gray-700 hover:bg-gray-800/80 hover:border-gray-600 hover:scale-105' 
                        : 'bg-gray-900/40 border-gray-800 opacity-60'
                    }`}
                    onClick={() => experiment.available && handleExperimentSelect(experiment.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={experiment.available ? "default" : "secondary"}>
                          {experiment.available ? "Available" : "Coming Soon"}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            experiment.difficulty === "Beginner" ? "border-green-500 text-green-400" :
                            experiment.difficulty === "Intermediate" ? "border-yellow-500 text-yellow-400" :
                            "border-red-500 text-red-400"
                          }
                        >
                          {experiment.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-xl">{experiment.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {experiment.category} • {experiment.duration}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                        {experiment.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">Key Features:</h4>
                        {experiment.features.map((feature, i) => (
                          <div key={i} className="flex items-center text-xs text-gray-400">
                            <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          className="relative z-10 py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <h3 className="text-5xl font-bold mb-6">Why ChemiQ?</h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Revolutionary VR technology meets rigorous chemistry education
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "100% Safe Learning",
                  description: "Experiment with dangerous chemicals safely in VR. No risk of accidents or exposure.",
                  icon: "🛡️"
                },
                {
                  title: "Precise Hand Tracking", 
                  description: "Natural hand movements control all lab equipment. No controllers needed.",
                  icon: "👋"
                },
                {
                  title: "Real Chemistry",
                  description: "Accurate molecular behavior and chemical reactions based on real science.",
                  icon: "⚗️"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 + index * 0.2 }}
                >
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="relative z-10 py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <div className="container mx-auto px-6">
            <motion.h3
              className="text-4xl md:text-6xl font-bold mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.7 }}
            >
              Ready to Transform
              <br />
              Chemistry Education?
            </motion.h3>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-full"
                onClick={() => handleExperimentSelect('ph-testing')}
              >
                Start First Experiment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black text-lg px-12 py-6 rounded-full"
              >
                Request Demo
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}