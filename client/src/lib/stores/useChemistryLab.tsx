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

interface MetalSalt {
  id: string;
  position: [number, number, number];
  name: string;
  formula: string;
  ion: string;
  flameColor: string;
  flameColorName: string;
}

interface FlameTestResult {
  saltName: string;
  ion: string;
  flameColor: string;
  flameColorName: string;
  timestamp: number;
}

interface GasTest {
  id: string;
  gasName: string;
  formula: string;
  position: [number, number, number];
  testMethod: string;
  expectedResult: string;
  color: string;
}

interface GasTestResult {
  gasName: string;
  testMethod: string;
  result: string;
  correct: boolean;
  timestamp: number;
}

type ExperimentType = "pH Testing" | "Flame Tests" | "Displacement Reactions" | "Paper Chromatography" | "Gas Tests" | "Filtration" | "Evaporation" | "Decanting";

interface ChemistryLabState {
  // Lab state
  beakers: Beaker[];
  testStrips: TestStrip[];
  selectedStripId: string | null;
  currentExperiment: ExperimentType;

  // Flame test state
  metalSalts: MetalSalt[];
  bunsenBurnerOn: boolean;
  wireLoopSelected: boolean;
  selectedSaltId: string | null;
  lastFlameTestResult: FlameTestResult | null;

  // Gas test state
  gasTests: GasTest[];
  selectedGasId: string | null;
  selectedTestTool: string | null; // "lit-splint", "glowing-splint", "red-litmus", "blue-litmus", "limewater"
  lastGasTestResult: GasTestResult | null;

  // Progress tracking
  completedTests: number;
  totalTests: number;
  progress: number;
  lastTestResult: TestResult | null;

  // VR table height control
  vrTableHeight: number;
  vrHeightLocked: boolean;

  // Actions
  initializeLab: () => void;
  grabTestStrip: (stripId: string) => void;
  releaseTestStrip: () => void;
  testStripInLiquid: (stripId: string, beakerId: string) => void;
  updatePhysics: (delta: number) => void;
  resetLab: () => void;

  // Flame test actions
  selectSalt: (saltId: string) => void;
  performFlameTest: (saltId: string) => void;
  toggleBunsenBurner: () => void;
  selectWireLoop: () => void;
  releaseWireLoop: () => void;

  // Gas test actions
  selectGas: (gasId: string) => void;
  selectTestTool: (tool: string) => void;
  performGasTest: (gasId: string, tool: string) => void;
  releaseTestTool: () => void;

  // Experiment switching
  switchExperiment: (experiment: ExperimentType) => void;

  // VR table height actions
  setVrTableHeight: (height: number) => void;
  setVrHeightLocked: (locked: boolean) => void;
}

const initialBeakers: Beaker[] = [
  // Experiment 1: Common laboratory substances
  {
    id: "beaker-1",
    position: [-3, 1.54, -0.8],
    phValue: 1.2,
    liquidColor: "#ff4757",
    solutionName: "HCl (Strong Acid)"
  },
  {
    id: "beaker-2",
    position: [-2, 1.54, -0.8],
    phValue: 7.0,
    liquidColor: "#74b9ff",
    solutionName: "Distilled Water"
  },
  {
    id: "beaker-3",
    position: [-1, 1.54, -0.8],
    phValue: 13.2,
    liquidColor: "#00b894",
    solutionName: "NaOH (Strong Base)"
  },

  // Experiment 2: Comparing acid/base strength
  {
    id: "beaker-4",
    position: [0, 1.54, -0.8],
    phValue: 4.8,
    liquidColor: "#fdcb6e",
    solutionName: "Acetic Acid (Weak)"
  },
  {
    id: "beaker-5",
    position: [1, 1.54, -0.8],
    phValue: 10.5,
    liquidColor: "#a29bfe",
    solutionName: "Ammonia (Weak Base)"
  },

  // Experiment 3: Dilution effects
  {
    id: "beaker-6",
    position: [3, 1.54, -0.8],
    phValue: 2.8,
    liquidColor: "#ff7675",
    solutionName: "Diluted HCl"
  },

  // Experiment 4: Salt solutions (perpendicular table section)
  {
    id: "beaker-7",
    position: [2.5, 1.54, 0.5],
    phValue: 7.0,
    liquidColor: "#81ecec",
    solutionName: "NaCl (Neutral Salt)"
  },
  {
    id: "beaker-8",
    position: [2.5, 1.54, 1.5],
    phValue: 5.6,
    liquidColor: "#fab1a0",
    solutionName: "NH(4)Cl (Acidic Salt)"
  },
  {
    id: "beaker-9",
    position: [2.5, 1.54, 2.5],
    phValue: 8.4,
    liquidColor: "#55a3ff",
    solutionName: "Na(2)CO(3) (Basic Salt)"
  },

  // Experiment 5: Neutralization reaction sample
  {
    id: "beaker-10",
    position: [3.5, 1.54, 1],
    phValue: 6.8,
    liquidColor: "#6c5ce7",
    solutionName: "Near Neutralization"
  }
];

const initialTestStrips: TestStrip[] = [
  {
    id: "strip-1",
    position: [-2, 1.54, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-2",
    position: [-1.8, 1.54, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "strip-3",
    position: [-1.6, 1.54, 0.5],
    rotation: [0, 0, 0],
    phValue: -1
  },
  {
    id: "indicator-1",
    position: [-1.5, 1.54, 0.8],
    rotation: [0, 0, 0],
    phValue: -1
  }
];

const initialMetalSalts: MetalSalt[] = [
  {
    id: "salt-1",
    position: [-0.9, 1.54, -0.2],
    name: "Sodium Chloride",
    formula: "NaCl",
    ion: "Na(+)",
    flameColor: "#FFD700",
    flameColorName: "Yellow"
  },
  {
    id: "salt-2",
    position: [-0.6, 1.54, -0.2],
    name: "Potassium Nitrate",
    formula: "KNO(3)",
    ion: "K(+)",
    flameColor: "#8A2BE2",
    flameColorName: "Lilac/Purple"
  },
  {
    id: "salt-3",
    position: [-0.3, 1.54, -0.2],
    name: "Calcium Chloride",
    formula: "CaCl(2)",
    ion: "Ca(2)^(+)",
    flameColor: "#B22222",
    flameColorName: "Brick Red"
  },
  {
    id: "salt-4",
    position: [0, 1.54, -0.2],
    name: "Copper(II) Sulfate",
    formula: "CuSO(4)",
    ion: "Cu(2)^(+)",
    flameColor: "#00CED1",
    flameColorName: "Blue-Green"
  }
];

// Initial gas tests setup
const initialGasTests: GasTest[] = [
  {
    id: "gas-1",
    gasName: "Hydrogen",
    formula: "H(2)",
    position: [-2, 1.64, -1],
    testMethod: "lit-splint",
    expectedResult: "Pop sound",
    color: "#e0e0e0"
  },
  {
    id: "gas-2", 
    gasName: "Oxygen",
    formula: "O(2)",
    position: [-1, 1.64, -1],
    testMethod: "glowing-splint",
    expectedResult: "Relights splint",
    color: "#87CEEB"
  },
  {
    id: "gas-3",
    gasName: "Carbon Dioxide", 
    formula: "CO(2)",
    position: [0, 1.64, -1],
    testMethod: "limewater",
    expectedResult: "Turns milky",
    color: "#D3D3D3"
  },
  {
    id: "gas-4",
    gasName: "Ammonia",
    formula: "NH(3)", 
    position: [1, 1.64, -1],
    testMethod: "red-litmus",
    expectedResult: "Turns blue",
    color: "#F0E68C"
  },
  {
    id: "gas-5",
    gasName: "Chlorine",
    formula: "Cl(2)",
    position: [2, 1.64, -1],
    testMethod: "blue-litmus",
    expectedResult: "Turns red then bleaches",
    color: "#90EE90"
  }
];

export const useChemistryLab = create<ChemistryLabState>()(
  subscribeWithSelector((set, get) => ({
    beakers: [],
    testStrips: [],
    selectedStripId: null,
    currentExperiment: "pH Testing",
    metalSalts: [],
    bunsenBurnerOn: false,
    wireLoopSelected: false,
    selectedSaltId: null,
    lastFlameTestResult: null,
    gasTests: [],
    selectedGasId: null,
    selectedTestTool: null,
    lastGasTestResult: null,
    completedTests: 0,
    totalTests: 10,
    progress: 0,
    lastTestResult: null,
    vrTableHeight: 0,
    vrHeightLocked: false,

    initializeLab: () => {
      set({
        beakers: initialBeakers,
        testStrips: initialTestStrips,
        metalSalts: initialMetalSalts,
        gasTests: initialGasTests,
        selectedStripId: null,
        bunsenBurnerOn: false,
        wireLoopSelected: false,
        selectedSaltId: null,
        selectedGasId: null,
        selectedTestTool: null,
        lastFlameTestResult: null,
        lastGasTestResult: null,
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
      // Physics update function - currently used for frame-based updates
      // Removed automatic collision testing to prevent false progress increments
      // Tests should only be performed through explicit user interactions
    },

    resetLab: () => {
      get().initializeLab();
      console.log("Lab reset");
    },

    selectSalt: (saltId: string) => {
      set({ selectedSaltId: saltId });
      console.log(`Selected salt: ${saltId}`);
    },

    performFlameTest: (saltId: string) => {
      const { metalSalts, wireLoopSelected, bunsenBurnerOn, completedTests, totalTests } = get();

      if (!wireLoopSelected || !bunsenBurnerOn) {
        console.log("Need wire loop and lit bunsen burner to perform flame test");
        return;
      }

      const salt = metalSalts.find(s => s.id === saltId);
      if (!salt) return;

      const flameTestResult: FlameTestResult = {
        saltName: salt.name,
        ion: salt.ion,
        flameColor: salt.flameColor,
        flameColorName: salt.flameColorName,
        timestamp: Date.now()
      };

      const newCompletedTests = completedTests + 1;
      const newProgress = (newCompletedTests / totalTests) * 100;

      set({
        lastFlameTestResult: flameTestResult,
        completedTests: newCompletedTests,
        progress: newProgress
      });

      console.log(`Flame test completed: ${salt.ion} produces ${salt.flameColorName} flame`);
    },

    toggleBunsenBurner: () => {
      const { bunsenBurnerOn } = get();
      set({ bunsenBurnerOn: !bunsenBurnerOn });
      console.log(`Bunsen burner ${!bunsenBurnerOn ? 'lit' : 'extinguished'}`);
    },

    selectWireLoop: () => {
      set({ wireLoopSelected: true });
      console.log("Wire loop selected");
    },

    releaseWireLoop: () => {
      set({ wireLoopSelected: false, selectedSaltId: null });
      console.log("Wire loop released");
    },

    // Gas test actions
    selectGas: (gasId: string) => {
      set({ selectedGasId: gasId });
      console.log(`Selected gas: ${gasId}`);
    },

    selectTestTool: (tool: string) => {
      set({ selectedTestTool: tool });
      console.log(`Selected test tool: ${tool}`);
    },

    performGasTest: (gasId: string, tool: string) => {
      const { gasTests } = get();
      const gas = gasTests.find(g => g.id === gasId);
      if (!gas) return;

      const isCorrect = gas.testMethod === tool;
      const result = isCorrect ? gas.expectedResult : "No reaction";

      const gasTestResult: GasTestResult = {
        gasName: gas.gasName,
        testMethod: tool,
        result: result,
        correct: isCorrect,
        timestamp: Date.now()
      };

      const { completedTests, totalTests } = get();
      const newCompletedTests = completedTests + 1;
      const newProgress = (newCompletedTests / totalTests) * 100;

      set({
        lastGasTestResult: gasTestResult,
        completedTests: newCompletedTests,
        progress: newProgress,
        selectedGasId: null,
        selectedTestTool: null
      });

      console.log(`Gas test completed: ${gas.gasName} with ${tool} - ${result}`);
    },

    releaseTestTool: () => {
      set({ selectedTestTool: null });
      console.log("Test tool released");
    },

    switchExperiment: (experiment: ExperimentType) => {
      set({ 
        currentExperiment: experiment,
        completedTests: 0,
        progress: 0,
        lastTestResult: null,
        lastFlameTestResult: null,
        lastGasTestResult: null,
        selectedStripId: null,
        selectedSaltId: null,
        selectedGasId: null,
        selectedTestTool: null,
        bunsenBurnerOn: false,
        wireLoopSelected: false
      });
      console.log(`Switched to experiment: ${experiment}`);
    },

    setVrTableHeight: (height: number) => {
      set({ vrTableHeight: height });
    },

    setVrHeightLocked: (locked: boolean) => {
      set({ vrHeightLocked: locked });
    }
  }))
);