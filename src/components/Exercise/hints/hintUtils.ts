/**
 * Utility functions for determining which hint strategies to use
 */

/**
 * Determines if the compensation strategy would be useful for this multiplication problem
 * Works when one of the factors is close to a "friendly number" like 10, 20, etc.
 */
export const isCompensationUseful = (factor1: number, factor2: number): boolean => {
    // Check if either factor is 9, 11, 19, 21, etc. (1 away from a friendly number)
    // or 8, 12, 18, 22, etc. (2 away from a friendly number)
    return (
      factor1 % 10 === 9 || 
      factor1 % 10 === 1 || 
      factor2 % 10 === 9 || 
      factor2 % 10 === 1 ||
      factor1 % 10 === 8 ||
      factor1 % 10 === 2 ||
      factor2 % 10 === 8 ||
      factor2 % 10 === 2
    );
  };
  
  /**
   * Determines if the doubling and halving strategy would be useful
   * Works well when one factor is even and can be halved while the other is doubled
   */
  export const isDoublingHalvingUseful = (factor1: number, factor2: number): boolean => {
    return (
      (factor1 % 2 === 0 || factor2 % 2 === 0) && // At least one factor is even
      (factor1 > 5 || factor2 > 5) // One factor is large enough to make this worthwhile
    );
  };
  
  /**
   * Determines if the distributive property strategy would be useful
   * Works well for multiplication with larger numbers
   */
  export const isDistributiveUseful = (factor1: number, factor2: number): boolean => {
    return (
      (factor1 >= 10 || factor2 >= 10) && // At least one factor is 10 or larger
      (factor1 % 10 !== 0 && factor2 % 10 !== 0) // Neither factor is a multiple of 10
    );
  };
  
  /**
   * Determines if the missing factor problem involves a multiplication fact that
   * the student should already have memorized (based on grade level 1-3)
   */
  export const isBasicFact = (known: number, product: number): boolean => {
    // For 1st-3rd grade, facts up to 10×10 should be memorized
    return known <= 10 && product <= 100;
  };
  
  /**
   * Selects the most appropriate visualization type based on the size of numbers
   */
  export const selectVisualizationType = (factor1: number, factor2: number): 'groups' | 'numberLine' | 'areaModel' => {
    if (factor1 <= 5 && factor2 <= 5) {
      return 'groups';
    } else if (factor1 <= 10 && factor2 <= 10) {
      return 'numberLine';
    } else {
      return 'areaModel';
    }
  };
  
  /**
   * Selects the most appropriate visualization for missing factor problems
   */
  export const selectMissingFactorVisualization = (product: number): 'groups' | 'numberLine' | 'factTriangle' => {
    if (product <= 20) {
      return 'groups';
    } else if (product <= 100) {
      return 'numberLine';
    } else {
      return 'factTriangle';
    }
  };