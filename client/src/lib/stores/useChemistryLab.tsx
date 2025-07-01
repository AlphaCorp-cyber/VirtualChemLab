import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getPHColor, generateRandomPH } from "../phChemistry";
import { checkCollision } from "../labPhysics";

interface Beaker {
  id: string;
  position: [number, number, number];
  phValue: number;
  liquidColor: string;
  solutionName: string;
}

interface TestStrip {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  phValue: number; // -1 means unused
}

interface TestResult {
  phValue: number;
  color: string;
  solutionName: string;
  timestamp: number;
}

interface ChemistryLabState {
  // Lab state
  beakers: Beaker[];
  testStrips: TestStrip[];
  selectedStripId: string | null;
  currentExperiment: string;
  
  // Progress tracking
  completedTests: number;
  totalTests: number;
  progress: number;
  lastTestResult: TestResult | null;
  
  // Actions
  initializeLab: () => void;
  grabTestStrip: (stripId: string) => void;
  releaseTestStrip: () => void;
  testStripInLiquid: (stripId: string, beakerId: string) => void;
  updatePhysics: (delta: number) => void;
  resetLab: () => void;
}

const initialBeakers: Beaker[] = [
  // Experiment 1: Common laboratory substances
  {
    id: "beaker-1",
    position: [-3, 1.52, -0.8],
    phValue: 1.2,
    liquidColor: "#ff4757",
    solutionName: "HCl (Strong Acid)"
  },
  {
    id: "beaker-2",
    position: [-2, 1.52, -0.8],
    phValue: 7.0,
    liquidColor: "#74b9ff",
    solutionName: "Distilled Water"
  },
  {
    id: "beaker-3",
    position: [-1, 1.52, -0.8],
    phValue: 13.2,
    liquidColor: "#00b894",
    solutionName: "NaOH (Strong Base)"
  },
  
  // Experiment 2: Comparing acid/base strength
  {
    id: "beaker-4",
    position: [0, 1.52, -0.8],
    phValue: 4.8,
    liquidColor: "#fdcb6e",
    solutionName: "Acetic Acid (Weak)"
  },
  {
    id: "beaker-5",
    position: [1, 1.52, -0.8],
    phValue: 10.5,
    liquidColor: "#a29bfe",
    solutionName: "Ammonia (Weak Base)"
  },
  
  // Experiment 3: Dilution effects
  {
    id: "beaker-6",
    position: [2, 1.52, -0.8],
    phValue: 2.8,
    liquidColor: "#ff7675",
    solutionName: "Diluted HCl"
  },
  
  // Experiment 4: Salt solutions (perpendicular table section)
  {
    id: "beaker-7",
    position: [2.5, 1.52, 0.5],
    phValue: 7.0,
    liquidColor: "#81ecec",
    solutionName: "NaCl (Neutral Salt)"
  },
  {
    id: "beaker-8",
    position: [2.5, 1.52, 1.5],
    phValue: 5.6,
    liquidColor: "#fab1a0",
    solutionName: "NH₄Cl (Acidic Salt)"
  },
  {
    id: "beaker-9",
    position: [2.5, 1.52, 2.5],
    phValue: 8.4,
    liquidColor: "#55a3ff",
    solutionName: "Na₂CO₃ (Basic Salt)"
  },
  
  // Experiment 5: Neutralization reaction sample
  {
    id: "beaker-10",
    position: [3.5, 1.52, 1],
    phValue: 6.8,
    liquidColor: "#6c5ce7",
    solutionName: "Near Neutralization"
  }
];

const initialTestStrips: TestStrip[] = [
  {
    id: "strip-1",
    position: [-2, 1.5, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-2",
    position: [-1.8, 1.5, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-3",
    position: [-1.6, 1.5, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "indicator-1",
    position: [-1.5, 1.6, 0.8],
    rotation: [0, 0, 0],
    phValue: -1
  }
];

export const useChemistryLab = create<ChemistryLabState>()(
  subscribeWithSelector((set, get) => ({
    beakers: [],
    testStrips: [],
    selectedStripId: null,
    currentExperiment: "pH Testing",
    completedTests: 0,
    totalTests: 10,
    progress: 0,
    lastTestResult: null,

    initializeLab: () => {
      set({
        beakers: initialBeakers,
        testStrips: initialTestStrips,
        selectedStripId: null,
        completedTests: 0,
        progress: 0,
        lastTestResult: null
      });
      console.log("Chemistry lab initialized");
    },

    grabTestStrip: (stripId: string) => {
      const { selectedStripId } = get();
      if (selectedStripId) return; // Already holding a strip
      
      set({ selectedStripId: stripId });
      console.log(`Grabbed test strip: ${stripId}`);
    },

    releaseTestStrip: () => {
      const { selectedStripId } = get();
      if (!selectedStripId) return;
      
      set({ selectedStripId: null });
      console.log(`Released test strip: ${selectedStripId}`);
    },

    testStripInLiquid: (stripId: string, beakerId: string) => {
      const { beakers, testStrips, completedTests, totalTests } = get();
      
      const beaker = beakers.find(b => b.id === beakerId);
      if (!beaker) return;
      
      // Update the test strip with the pH value
      const updatedStrips = testStrips.map(strip => 
        strip.id === stripId 
          ? { ...strip, phValue: beaker.phValue }
          : strip
      );
      
      const testResult: TestResult = {
        phValue: beaker.phValue,
        color: getPHColor(beaker.phValue),
        solutionName: beaker.solutionName,
        timestamp: Date.now()
      };
      
      const newCompletedTests = completedTests + 1;
      const newProgress = (newCompletedTests / totalTests) * 100;
      
      set({
        testStrips: updatedStrips,
        lastTestResult: testResult,
        completedTests: newCompletedTests,
        progress: newProgress
      });
      
      console.log(`Test completed: pH ${beaker.phValue} - ${beaker.solutionName}`);
    },

    updatePhysics: (delta: number) => {
      const { selectedStripId, beakers, testStrips } = get();
      
      if (!selectedStripId) return;
      
      const selectedStrip = testStrips.find(s => s.id === selectedStripId);
      if (!selectedStrip) return;
      
      // Check for collisions with beakers
      beakers.forEach(beaker => {
        if (checkCollision(selectedStrip.position, beaker.position, 0.5)) {
          // Auto-test when strip gets close to liquid
          if (selectedStrip.phValue === -1) { // Only test unused strips
            get().testStripInLiquid(selectedStripId, beaker.id);
          }
        }
      });
    },

    resetLab: () => {
      get().initializeLab();
      console.log("Lab reset");
    }
  }))
);
