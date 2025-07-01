/**
 * Chemistry utilities for pH calculations and color mapping
 */

export function getPHColor(phValue: number): string {
  // Clamp pH value between 0 and 14
  const ph = Math.max(0, Math.min(14, phValue));
  
  // Universal indicator colors (much more dramatic and realistic)
  if (ph <= 1) {
    return "#FF0000"; // Bright red - very acidic
  } else if (ph <= 2) {
    return "#FF3300"; // Red-orange
  } else if (ph <= 3) {
    return "#FF6600"; // Orange
  } else if (ph <= 4) {
    return "#FF9900"; // Orange-yellow
  } else if (ph <= 5) {
    return "#FFCC00"; // Yellow-orange
  } else if (ph <= 6) {
    return "#FFFF00"; // Bright yellow
  } else if (ph <= 6.5) {
    return "#CCFF00"; // Yellow-green
  } else if (ph >= 6.5 && ph <= 7.5) {
    return "#00FF00"; // Bright green - neutral
  } else if (ph <= 8) {
    return "#00CCFF"; // Light blue
  } else if (ph <= 9) {
    return "#0099FF"; // Blue
  } else if (ph <= 10) {
    return "#0066FF"; // Darker blue
  } else if (ph <= 11) {
    return "#0033FF"; // Deep blue
  } else if (ph <= 12) {
    return "#3300FF"; // Blue-purple
  } else if (ph <= 13) {
    return "#6600FF"; // Purple
  } else {
    return "#9900FF"; // Deep purple - very basic
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
