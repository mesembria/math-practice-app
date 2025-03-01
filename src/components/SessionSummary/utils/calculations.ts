import { SessionSummary } from "@/services/api";


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
 */
export const calculateSessionStats = (summary: SessionSummary): SessionStats => {
  const correctCount = summary.attempts.filter(a => a.isCorrect).length;
  const totalCount = summary.attempts.length;
  const correctPercentage = Math.round((correctCount / totalCount) * 100);
  
  const responseTimes = summary.attempts.map(a => a.responseTime);
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  
  const fastestTime = Math.min(...responseTimes);
  const slowestTime = Math.max(...responseTimes);
  
  // Get problem with highest weight (needs most practice)
  const highestWeightProblem = [...summary.problemWeights].sort((a, b) => b.weight - a.weight)[0];
  
  return {
    correctCount,
    totalCount,
    correctPercentage,
    avgResponseTime: Math.round(avgResponseTime),
    fastestTime: Math.round(fastestTime),
    slowestTime: Math.round(slowestTime),
    needsMostPractice: highestWeightProblem ? 
      `${highestWeightProblem.factor1} × ${highestWeightProblem.factor2}` : 
      'None'
  };
};