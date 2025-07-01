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
  {
    id: "beaker-1",
    position: [-1.5, 1.15, -0.5],
    phValue: 2.1,
    liquidColor: "#ff6b6b",
    solutionName: "Hydrochloric Acid"
  },
  {
    id: "beaker-2",
    position: [-0.5, 1.15, -0.5],
    phValue: 7.0,
    liquidColor: "#4ecdc4",
    solutionName: "Pure Water"
  },
  {
    id: "beaker-3",
    position: [0.5, 1.15, -0.5],
    phValue: 10.3,
    liquidColor: "#45b7d1",
    solutionName: "Sodium Hydroxide"
  },
  {
    id: "beaker-4",
    position: [1.5, 1.15, -0.5],
    phValue: 4.5,
    liquidColor: "#f9ca24",
    solutionName: "Acetic Acid"
  }
];

const initialTestStrips: TestStrip[] = [
  {
    id: "strip-1",
    position: [-2, 1.2, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-2",
    position: [-1.8, 1.2, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-3",
    position: [-1.6, 1.2, 0.5],
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
    totalTests: 4,
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
