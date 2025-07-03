import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Volume2, VolumeX, RotateCcw, FlaskConical, Flame, Lock, Unlock, Home, ArrowLeft } from "lucide-react";

interface LabUIProps {
  experimentId?: string;
}

export function LabUI({ experimentId }: LabUIProps) {
  const { 
    currentExperiment, 
    progress, 
    completedTests, 
    totalTests, 
    resetLab,
    selectedStripId,
    lastTestResult,
    lastFlameTestResult,
    lastGasTestResult,
    switchExperiment,
    selectedTestTool,
    vrHeightLocked,
    vrTableHeight
  } = useChemistryLab();

  const { isMuted, toggleMute } = useAudio();

  const getPhClassification = (ph: number) => {
    if (ph < 7) return { label: "Acidic", color: "destructive" };
    if (ph === 7) return { label: "Neutral", color: "secondary" };
    return { label: "Basic", color: "default" };
  };

  const handleReturnToMenu = () => {
    // Navigate back to main landing page
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 space-y-4 pointer-events-auto">
        {/* VR Navigation Menu - Always visible */}
        
        {/* Experiment Selector - only show if no specific experiment is selected */}
        {!experimentId && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Experiment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant={currentExperiment === "pH Testing" ? "default" : "outline"}
                size="sm"
                onClick={() => switchExperiment("pH Testing")}
                className="flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                pH Testing
              </Button>
              <Button
                variant={currentExperiment === "Flame Tests" ? "default" : "outline"}
                size="sm"
                onClick={() => switchExperiment("Flame Tests")}
                className="flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Flame Tests
              </Button>
              <Button
                variant={currentExperiment === "Gas Tests" ? "default" : "outline"}
                size="sm"
                onClick={() => switchExperiment("Gas Tests")}
                className="flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Gas Tests
              </Button>
              <Button
                variant={currentExperiment === "Displacement Reactions" ? "default" : "outline"}
                size="sm"
                onClick={() => switchExperiment("Displacement Reactions")}
                className="flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Displacement
              </Button>
              <Button
                variant={currentExperiment === "Paper Chromatography" ? "default" : "outline"}
                size="sm"
                onClick={() => switchExperiment("Paper Chromatography")}
                className="flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Paper Chromatography
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Experiment Info */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{currentExperiment}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Day 1 Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex gap-2 text-sm">
              <span>Tests completed: {completedTests}/{totalTests}</span>
            </div>

            <div className="text-xs text-gray-500">
              08:19 AM - {currentExperiment} Experiment
            </div>
          </CardContent>
        </Card>

        {/* Last Test Result */}
        {lastTestResult && currentExperiment === "pH Testing" && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Last pH Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{lastTestResult.solutionName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">pH:</span>
                  <Badge 
                    variant={getPhClassification(lastTestResult.phValue).color as any}
                    className="text-xs"
                  >
                    {lastTestResult.phValue.toFixed(1)}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    ({getPhClassification(lastTestResult.phValue).label})
                  </span>
                </div>
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: lastTestResult.color }}
                  title={`Color: ${lastTestResult.color}`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Flame Test Result */}
        {lastFlameTestResult && currentExperiment === "Flame Tests" && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Last Flame Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{lastFlameTestResult.saltName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Ion:</span>
                  <Badge variant="default" className="text-xs">
                    {lastFlameTestResult.ion}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Flame Color:</span>
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: lastFlameTestResult.flameColor }}
                    title={`Color: ${lastFlameTestResult.flameColorName}`}
                  />
                  <span className="text-xs text-gray-600">
                    {lastFlameTestResult.flameColorName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Gas Test Result */}
        {lastGasTestResult && currentExperiment === "Gas Tests" && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Last Gas Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{lastGasTestResult.gasName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Test Method:</span>
                  <Badge variant="default" className="text-xs">
                    {lastGasTestResult.testMethod.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Result:</span>
                  <Badge 
                    variant={lastGasTestResult.correct ? "default" : "destructive"} 
                    className="text-xs"
                  >
                    {lastGasTestResult.result}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    {lastGasTestResult.correct ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions panel */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="bg-white/90 backdrop-blur-sm max-w-md">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <div className="text-sm space-y-1">
              {currentExperiment === "pH Testing" && (
                selectedStripId ? (
                  selectedStripId.includes('indicator') ? (
                    <>
                      <p>✓ pH Indicator bottle selected</p>
                      <p>→ Click on a beaker to pour indicator</p>
                      <p>Press R to release the bottle</p>
                    </>
                  ) : (
                    <>
                      <p>✓ Test strip selected</p>
                      <p>→ Dip the strip into a beaker to test pH</p>
                      <p>Press R to release the strip</p>
                    </>
                  )
                ) : (
                  <>
                    <p>Click on pH indicator bottle to grab it</p>
                    <p>Pour indicator into beakers to reveal pH</p>
                    <p>Press G to grab a pH test strip</p>
                    <p>Use WASD keys to move around the lab</p>
                  </>
                )
              )}
              {currentExperiment === "Flame Tests" && (
                <>
                  <p>Select a metal salt sample</p>
                  <p>Use the wire loop to perform flame tests</p>
                </>
              )}
              {currentExperiment === "Gas Tests" && (
                selectedTestTool ? (
                  <>
                    <p>✓ Test tool selected: {selectedTestTool.replace('-', ' ')}</p>
                    <p>→ Click on a gas tube to test it</p>
                    <p>Compare the result with expected outcomes</p>
                  </>
                ) : (
                  <>
                    <p>Select a test tool first:</p>
                    <p>• Lit Splint - Tests for hydrogen (pop sound)</p>
                    <p>• Glowing Splint - Tests for oxygen (relights)</p>
                    <p>• Red Litmus - Tests for ammonia (turns blue)</p>
                    <p>• Blue Litmus - Tests for chlorine (turns red)</p>
                    <p>• Limewater - Tests for CO₂ (turns milky)</p>
                  </>
                )
              )}
              {currentExperiment === "Displacement Reactions" && (
                <>
                  <p>Select a metal to test</p>
                  <p>Place metal in solution</p>
                  <p>Observe color changes and deposits</p>
                </>
              )}
              {currentExperiment === "Paper Chromatography" && (
                <>
                  <p>Apply ink sample to paper</p>
                  <p>Place paper in solvent</p>
                  <p>Watch pigments separate</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test results panel */}
      {lastTestResult && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Test Result
                <Badge variant={getPhClassification(lastTestResult.phValue).color as any}>
                  {getPhClassification(lastTestResult.phValue).label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-mono">
                  pH: {lastTestResult.phValue.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Solution: {lastTestResult.solutionName}
                </div>
                <div className="w-8 h-8 rounded border" 
                     style={{ backgroundColor: lastTestResult.color }}>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success message */}
      {completedTests === totalTests && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/50">
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Experiment Complete!</h2>
              <p className="text-gray-600 mb-4">
                You've successfully completed all tests.
              </p>
              <Button onClick={resetLab}>
                Start New Experiment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VR Height Control Indicator */}
      {(vrHeightLocked !== undefined || vrTableHeight !== 0) && (
        <div className="absolute top-4 right-4 mb-16 pointer-events-auto">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                {vrHeightLocked ? (
                  <>
                    <Lock size={16} className="text-red-500" />
                    <span className="text-red-600 font-medium">Table Height Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock size={16} className="text-green-500" />
                    <span className="text-green-600 font-medium">Height Adjustable</span>
                  </>
                )}
                {vrTableHeight !== 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    {vrTableHeight > 0 ? '+' : ''}{vrTableHeight.toFixed(1)}m
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {vrHeightLocked ? 'Bring hands together to unlock' : 'Spread hands to adjust height'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audio control and Reset button */}
      <div className="absolute top-20 right-4 flex gap-2 pointer-events-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={resetLab}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCcw size={20} />
        </Button>
      </div>
    </div>
  );
}