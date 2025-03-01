// Utility functions for formatting data

/**
 * Format milliseconds to seconds with one decimal place
 */
export const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(1) + 's';
  };
  
  /**
   * Get color for response time comparison to average
   */
  export const getTimeComparisonColor = (actual: number, average: number | null): string => {
    if (!average) return 'text-gray-500';
    
    const diff = actual - average;
    const percentDiff = (diff / average) * 100;
    
    if (percentDiff < -20) return 'text-green-600'; // Much faster
    if (percentDiff < -5) return 'text-green-500'; // Faster
    if (percentDiff < 5) return 'text-gray-600'; // About average
    if (percentDiff < 20) return 'text-yellow-500'; // Slower
    return 'text-red-500'; // Much slower
  };
  
/**
 * Get color based on weight relative to default weight
 * Lower weights (below default) indicate mastery (green)
 * Higher weights (above default) indicate need for practice (red)
 */
export const getWeightColor = (weight: number): string => {
  // The default weight for a new problem is 10
  const defaultWeight = 10;
  const maxIntensity = 0.9; // Maximum color intensity (0-1)
  
  if (weight === defaultWeight) return 'rgb(229, 231, 235)'; // gray-200 equivalent for neutral
  
  const diff = weight - defaultWeight;
  const normalizedDiff = Math.min(Math.abs(diff) / defaultWeight, 1);
  // Use logarithmic scale for better visualization of small differences
  const intensity = Math.min(maxIntensity * Math.log10(1 + normalizedDiff * 9), maxIntensity);
  
  if (diff > 0) {
    // Red spectrum for weights above default (needs more practice)
    return `rgba(239, 68, 68, ${intensity})`; // red-500 with variable opacity
  } else {
    // Green spectrum for weights below default (mastered)
    return `rgba(34, 197, 94, ${intensity})`; // green-500 with variable opacity
  }
};
  
  /**
   * Calculate relative speed indicator position (0-100)
   */
  export const getSpeedPosition = (responseTime: number, averageTime: number | null): number => {
    if (!averageTime) return 50; // Center if no average
    const diff = responseTime - averageTime;
    const maxDiff = averageTime; // Use average as scale
    const position = 50 - (diff / maxDiff) * 50;
    return Math.max(5, Math.min(95, position)); // Keep within visible range
  };