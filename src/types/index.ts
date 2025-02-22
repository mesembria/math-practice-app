export interface Problem {
  id: string;
  factor1: number;
  factor2: number;
  answer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface User {
  id: string;
  name: string;
  isParent: boolean;
}
