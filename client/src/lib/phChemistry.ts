/**
 * Chemistry utilities for pH calculations and color mapping
 */

export function getPHColor(phValue: number): string {
  // Clamp pH value between 0 and 14
  const ph = Math.max(0, Math.min(14, phValue));
  
  if (ph < 7) {
    // Acidic - Red spectrum
    const intensity = (7 - ph) / 7;
    const red = Math.floor(255 * intensity);
    const green = Math.floor(100 * (1 - intensity));
    return `rgb(${red}, ${green}, 0)`;
  } else if (ph === 7) {
    // Neutral - Green
    return "#00ff00";
  } else {
    // Basic - Blue spectrum
    const intensity = (ph - 7) / 7;
    const blue = Math.floor(255 * intensity);
    const green = Math.floor(100 * (1 - intensity));
    return `rgb(0, ${green}, ${blue})`;
  }
}

export function getPhClassification(phValue: number): string {
  if (phValue < 7) return "Acidic";
  if (phValue === 7) return "Neutral";
  return "Basic";
}

export function generateRandomPH(): number {
  // Generate random pH values in realistic ranges
  const ranges = [
    [1, 3],   // Strong acid
    [4, 6],   // Weak acid
    [7, 7],   // Neutral
    [8, 10],  // Weak base
    [11, 13]  // Strong base
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.random() * (range[1] - range[0]) + range[0];
}

export function getPhDescription(phValue: number): string {
  if (phValue < 2) return "Very Strong Acid";
  if (phValue < 4) return "Strong Acid";
  if (phValue < 6) return "Weak Acid";
  if (phValue < 7.5) return "Neutral";
  if (phValue < 9) return "Weak Base";
  if (phValue < 12) return "Strong Base";
  return "Very Strong Base";
}
