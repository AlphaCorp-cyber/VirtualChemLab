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
      {/* Animated Background with Lab Equipment */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-30">
          {/* Floating Test Tubes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`test-tube-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                rotate: [0, 10, -10, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            >
              {/* Test Tube SVG */}
              <svg width="24" height="40" viewBox="0 0 24 40" className="text-blue-400">
                <rect x="8" y="0" width="8" height="6" fill="currentColor" opacity="0.6" rx="1"/>
                <rect x="9" y="6" width="6" height="28" fill="currentColor" opacity="0.4" rx="3"/>
                <rect x="9" y="20" width="6" height="14" fill="#4FC3F7" opacity="0.8" rx="3"/>
                <circle cx="12" cy="27" r="1" fill="#81C784" opacity="0.9"/>
              </svg>
            </motion.div>
          ))}

          {/* Floating Beakers */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`beaker-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, -15, 0],
                rotate: [-5, 5, -5],
                scale: [0.9, 1.3, 0.9]
              }}
              transition={{
                duration: 8 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
            >
              {/* Beaker SVG */}
              <svg width="32" height="36" viewBox="0 0 32 36" className="text-purple-400">
                <path d="M6 8 L26 8 L24 32 L8 32 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
                <rect x="4" y="6" width="24" height="3" fill="currentColor" opacity="0.6" rx="1"/>
                <rect x="8" y="20" width="16" height="12" fill="#9C27B0" opacity="0.7" rx="2"/>
                <circle cx="12" cy="26" r="1.5" fill="#E1BEE7" opacity="0.9"/>
                <circle cx="20" cy="24" r="1" fill="#E1BEE7" opacity="0.8"/>
              </svg>
            </motion.div>
          ))}

          {/* Floating Erlenmeyer Flasks */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`flask-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -35, 0],
                x: [0, 25, 0],
                rotate: [0, -8, 8, 0],
                scale: [0.7, 1.1, 0.7]
              }}
              transition={{
                duration: 7 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              {/* Erlenmeyer Flask SVG */}
              <svg width="28" height="42" viewBox="0 0 28 42" className="text-green-400">
                <rect x="12" y="0" width="4" height="18" fill="currentColor" opacity="0.6"/>
                <path d="M12 18 L4 38 L24 38 Z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1"/>
                <path d="M6 32 L22 32 L20 38 L8 38 Z" fill="#4CAF50" opacity="0.8"/>
                <circle cx="10" cy="35" r="1" fill="#81C784" opacity="0.9"/>
                <circle cx="18" cy="34" r="0.8" fill="#81C784" opacity="0.7"/>
              </svg>
            </motion.div>
          ))}

          {/* Floating Pipettes */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`pipette-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                x: [0, 10, 0],
                rotate: [0, 15, -15, 0],
                scale: [0.8, 1.0, 0.8]
              }}
              transition={{
                duration: 10 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            >
              {/* Pipette SVG */}
              <svg width="16" height="60" viewBox="0 0 16 60" className="text-yellow-400">
                <rect x="6" y="0" width="4" height="8" fill="currentColor" opacity="0.7" rx="2"/>
                <rect x="7" y="8" width="2" height="45" fill="currentColor" opacity="0.5"/>
                <circle cx="8" y="53" r="3" fill="currentColor" opacity="0.6"/>
                <rect x="7" y="40" width="2" height="8" fill="#FFC107" opacity="0.9"/>
              </svg>
            </motion.div>
          ))}

          {/* Floating Molecules */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`molecule-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, 15, 0],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 5 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            >
              {/* Molecule Structure SVG */}
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-cyan-400">
                <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.8"/>
                <circle cx="24" cy="8" r="3" fill="currentColor" opacity="0.8"/>
                <circle cx="16" cy="24" r="3" fill="currentColor" opacity="0.8"/>
                <circle cx="16" cy="16" r="2" fill="#FF5722" opacity="0.9"/>
                <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                <line x1="24" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                <line x1="16" y1="16" x2="16" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
              </svg>
            </motion.div>
          ))}

          {/* Floating Chemical Symbols */}
          {[
            { symbol: "H₂O", color: "text-blue-300", size: "text-2xl" },
            { symbol: "NaCl", color: "text-green-300", size: "text-xl" },
            { symbol: "CO₂", color: "text-gray-300", size: "text-lg" },
            { symbol: "HCl", color: "text-red-300", size: "text-xl" },
            { symbol: "NH₃", color: "text-yellow-300", size: "text-lg" },
            { symbol: "C₆H₁₂O₆", color: "text-purple-300", size: "text-sm" },
            { symbol: "CaCO₃", color: "text-orange-300", size: "text-lg" },
            { symbol: "H₂SO₄", color: "text-red-400", size: "text-xl" }
          ].map((chem, i) => (
            <motion.div
              key={`chemical-${i}`}
              className={`absolute ${chem.color} ${chem.size} font-bold opacity-60`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, 30, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 6
              }}
            >
              {chem.symbol}
            </motion.div>
          ))}

          {/* Bubbling Particle Effects */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute w-3 h-3 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, -200],
                scale: [0.5, 1, 0],
                opacity: [0.2, 0.6, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
            />
          ))}

          {/* DNA Helix Pattern */}
          <svg className="absolute top-1/4 right-1/4 w-64 h-64 opacity-10" viewBox="0 0 200 200">
            <motion.path
              d="M50,10 Q100,50 150,10 T250,10 M50,190 Q100,150 150,190 T250,190"
              stroke="url(#gradient)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>

          {/* Periodic Table Elements */}
          <motion.div 
            className="absolute top-16 left-1/3 opacity-30"
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ duration: 15, repeat: Infinity, delay: 1 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded border-2 border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          </motion.div>

          <motion.div 
            className="absolute bottom-16 right-1/4 opacity-30"
            animate={{
              y: [-15, 15, -15],
              rotate: [0, -360],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded border-2 border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
          </motion.div>

          <motion.div 
            className="absolute top-1/3 left-1/2 opacity-30"
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 180, 360],
              scale: [0.7, 1.3, 0.7]
            }}
            transition={{ duration: 18, repeat: Infinity, delay: 5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded border-2 border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          </motion.div>
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

        {/* Large Floating Lab Equipment */}
        <motion.div 
          className="absolute top-20 left-20 opacity-40"
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 5, -5, 0],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 0 }}
        >
          {/* Bunsen Burner */}
          <svg width="48" height="64" viewBox="0 0 48 64" className="text-orange-400">
            <rect x="18" y="40" width="12" height="24" fill="currentColor" opacity="0.6" rx="2"/>
            <rect x="14" y="60" width="20" height="4" fill="currentColor" opacity="0.8"/>
            <rect x="20" y="30" width="8" height="10" fill="currentColor" opacity="0.4"/>
            <circle cx="24" cy="25" r="6" fill="#FF5722" opacity="0.8"/>
            <circle cx="24" cy="25" r="3" fill="#FFC107" opacity="0.9"/>
            <ellipse cx="24" cy="20" rx="4" ry="8" fill="#2196F3" opacity="0.7"/>
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute top-32 right-32 opacity-40"
          animate={{
            y: [-20, 20, -20],
            rotate: [0, -8, 8, 0],
            scale: [0.9, 1.2, 0.9]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        >
          {/* Microscope */}
          <svg width="56" height="72" viewBox="0 0 56 72" className="text-gray-400">
            <rect x="20" y="60" width="16" height="12" fill="currentColor" opacity="0.8" rx="2"/>
            <rect x="24" y="40" width="8" height="20" fill="currentColor" opacity="0.6"/>
            <circle cx="28" cy="35" r="8" fill="currentColor" opacity="0.5"/>
            <circle cx="28" cy="35" r="5" fill="#4CAF50" opacity="0.7"/>
            <rect x="32" y="25" width="12" height="4" fill="currentColor" opacity="0.6"/>
            <rect x="35" y="15" width="6" height="10" fill="currentColor" opacity="0.4"/>
            <circle cx="38" cy="12" r="3" fill="#2196F3" opacity="0.8"/>
          </svg>
        </motion.div>

        <motion.div 
          className="absolute bottom-32 left-1/4 opacity-40"
          animate={{
            y: [-25, 25, -25],
            rotate: [0, 10, -10, 0],
            scale: [0.7, 1.0, 0.7]
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        >
          {/* Graduated Cylinder */}
          <svg width="32" height="80" viewBox="0 0 32 80" className="text-blue-400">
            <rect x="8" y="10" width="16" height="60" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
            <rect x="6" y="8" width="20" height="4" fill="currentColor" opacity="0.6" rx="2"/>
            <rect x="10" y="35" width="12" height="25" fill="#03A9F4" opacity="0.8"/>
            {[...Array(8)].map((_, i) => (
              <line key={i} x1="8" y1={15 + i * 7} x2="12" y2={15 + i * 7} stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
            ))}
          </svg>
        </motion.div>

        <motion.div 
          className="absolute top-1/2 right-20 opacity-40"
          animate={{
            y: [-30, 30, -30],
            rotate: [0, -12, 12, 0],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 9, repeat: Infinity, delay: 1 }}
        >
          {/* Petri Dish */}
          <svg width="44" height="20" viewBox="0 0 44 20" className="text-green-400">
            <ellipse cx="22" cy="10" rx="20" ry="8" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
            <ellipse cx="22" cy="8" rx="18" ry="6" fill="currentColor" opacity="0.2"/>
            <circle cx="15" cy="8" r="2" fill="#4CAF50" opacity="0.8"/>
            <circle cx="28" cy="9" r="1.5" fill="#4CAF50" opacity="0.7"/>
            <circle cx="22" cy="6" r="1" fill="#81C784" opacity="0.9"/>
            <circle cx="18" cy="11" r="0.8" fill="#A5D6A7" opacity="0.6"/>
          </svg>
        </motion.div>

        <motion.div 
          className="absolute bottom-20 right-1/3 opacity-40"
          animate={{
            y: [-18, 18, -18],
            rotate: [0, 15, -15, 0],
            scale: [0.9, 1.3, 0.9]
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 3 }}
        >
          {/* Round Bottom Flask */}
          <svg width="40" height="52" viewBox="0 0 40 52" className="text-purple-400">
            <rect x="18" y="0" width="4" height="20" fill="currentColor" opacity="0.6"/>
            <circle cx="20" cy="35" r="15" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
            <circle cx="20" cy="35" r="12" fill="#9C27B0" opacity="0.6"/>
            <circle cx="16" cy="32" r="1.5" fill="#E1BEE7" opacity="0.9"/>
            <circle cx="24" cy="38" r="1" fill="#E1BEE7" opacity="0.8"/>
            <circle cx="20" cy="40" r="0.8" fill="#CE93D8" opacity="0.7"/>
          </svg>
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