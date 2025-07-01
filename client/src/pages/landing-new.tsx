import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

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
  "Beginner": "bg-green-500/20 text-green-300 border-green-400",
  "Intermediate": "bg-yellow-500/20 text-yellow-300 border-yellow-400",
  "Advanced": "bg-red-500/20 text-red-300 border-red-400"
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

export default function Landing() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: true });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const categories = ["All", ...Array.from(new Set(experiments.map(exp => exp.category)))];
  const filteredExperiments = selectedCategory === "All" 
    ? experiments 
    : experiments.filter(exp => exp.category === selectedCategory);

  const handleStartExperiment = (experimentId: string) => {
    if (experimentId === "ph-testing") {
      navigate("/lab");
    } else {
      navigate(`/lab/${experimentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <motion.h1 
              className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight"
              style={{ y: textY }}
            >
              FUTURE OF
              <br />
              <span className="text-white">CHEMISTRY</span>
              <br />
              EDUCATION
            </motion.h1>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-12">
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionary <span className="text-blue-400 font-semibold">Virtual Reality</span> laboratory 
              where students conduct real experiments safely, explore molecular structures in 3D, 
              and experience chemistry like never before.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-16">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400 px-4 py-2 text-sm">
                🥽 VR Hand Tracking
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-400 px-4 py-2 text-sm">
                🛡️ 100% Safe Environment
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400 px-4 py-2 text-sm">
                🧪 Real Chemistry Physics
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 px-4 py-2 text-sm">
                📊 Progress Analytics
              </Badge>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button
              onClick={() => navigate("/lab")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              🚀 Start Virtual Lab Experience
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-400 text-gray-300 hover:bg-white/10 px-8 py-4 text-lg rounded-full"
              onClick={() => {
                document.getElementById('experiments')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              📖 Explore Experiments
            </Button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-20 w-16 h-16 opacity-60"
          animate={floatingAnimation}
          transition={{ delay: 0 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
        </motion.div>
        
        <motion.div 
          className="absolute top-32 right-32 w-12 h-12 opacity-60"
          animate={floatingAnimation}
          transition={{ delay: 1 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg"></div>
        </motion.div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="relative py-24 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Revolutionary Impact on <span className="text-blue-400">Education</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Proven results from institutions worldwide using VR chemistry education
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "95%", label: "Student Engagement Increase", icon: "📈" },
              { number: "80%", label: "Better Retention Rates", icon: "🧠" },
              { number: "100%", label: "Zero Lab Accidents", icon: "🛡️" },
              { number: "50%", label: "Faster Learning Speed", icon: "⚡" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Experiments Section */}
      <motion.section 
        id="experiments"
        className="relative py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Interactive <span className="text-green-400">Experiments</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive curriculum covering all major chemistry topics with hands-on VR experiences
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="mb-12 text-center">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                      : "border-gray-400 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Experiments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiments.map((experiment, index) => (
              <motion.div
                key={experiment.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative"
              >
                <Card className={`relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden ${
                  !experiment.available ? 'opacity-60' : ''
                }`}>
                  {!experiment.available && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-white font-bold">
                      {experiment.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      {experiment.description}
                    </CardDescription>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Badge className={difficultyColors[experiment.difficulty]} variant="outline">
                        {experiment.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-purple-400 text-purple-300">
                        {experiment.duration}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-300 mb-2">
                          Key Features:
                        </h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {experiment.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => handleStartExperiment(experiment.id)}
                        disabled={!experiment.available}
                        className={`w-full mt-4 rounded-full font-semibold transition-all duration-300 ${
                          experiment.available 
                            ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105" 
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                        size="lg"
                      >
                        {experiment.available ? "🚀 Start Experiment" : "Coming Soon"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.section 
        className="relative py-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Chemistry Education?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of educators worldwide who are revolutionizing science learning with VR technology.
            </p>
            <Button
              onClick={() => navigate("/lab")}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300"
            >
              ⚡ Experience the Future Now
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}