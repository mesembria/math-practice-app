import { ProblemType, SessionSummary } from "../../../services/api";


export interface SessionStats {
  correctCount: number;
  totalCount: number;
  correctPercentage: number;
  avgResponseTime: number;
  fastestTime: number;
  slowestTime: number;
  needsMostPractice: string;
}

/**
 * Calculate summary statistics from session data
 * Now filters by problem type
 */
export const calculateSessionStats = (summary: SessionSummary, problemType: ProblemType): SessionStats => {
  // Filter attempts to match the current problem type
  const filteredAttempts = summary.attempts.filter(a => !a.problemType || a.problemType === problemType);
  
  const correctCount = filteredAttempts.filter(a => a.isCorrect).length;
  const totalCount = filteredAttempts.length;
  const correctPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  
  const responseTimes = filteredAttempts.map(a => a.responseTime);
  const avgResponseTime = responseTimes.length > 0 ? 
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
  
  const fastestTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const slowestTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  
  // Filter problem weights by problem type before sorting
  const relevantWeights = summary.problemWeights.filter(w => 
    !w.problemType || w.problemType === problemType
  );
  
  // Get problem with highest weight (needs most practice)
  const highestWeightProblem = relevantWeights.length > 0 ? 
    [...relevantWeights].sort((a, b) => b.weight - a.weight)[0] : null;
  
  // Format the practice string based on problem type
  let needsMostPractice = 'None';
  if (highestWeightProblem) {
    if (problemType === ProblemType.MISSING_FACTOR) {
      // For missing factor, show a more appropriate format
      const product = highestWeightProblem.factor1 * highestWeightProblem.factor2;
      needsMostPractice = `${highestWeightProblem.factor1} × ? = ${product}`;
      
      // Alternate between the two possible formats
      if (Math.random() > 0.5) {
        needsMostPractice = `? × ${highestWeightProblem.factor2} = ${product}`;
      }
    } else {
      // Standard multiplication format
      needsMostPractice = `${highestWeightProblem.factor1} × ${highestWeightProblem.factor2}`;
    }
  }
  
  return {
    correctCount,
    totalCount,
    correctPercentage,
    avgResponseTime: Math.round(avgResponseTime),
    fastestTime: Math.round(fastestTime),
    slowestTime: Math.round(slowestTime),
    needsMostPractice
  };
};