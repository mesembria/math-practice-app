export interface IUser {
  id: number;
  name: string;
  is_parent: boolean;
  current_level: number;
  created_at: Date;
  sessions: IExerciseSession[];
  statistics: IProblemStatistic[];
}

export interface IExerciseSession {
  id: number;
  user_id: number;
  start_time: Date;
  end_time: Date | null;
  total_problems: number;
  completed_problems: number;
  is_completed: boolean;
  user: IUser;
  attempts: IProblemAttempt[];
}

export interface IProblemAttempt {
  id: number;
  session_id: number;
  factor1: number;
  factor2: number;
  user_answer: number | null;
  is_correct: boolean | null;
  response_time_ms: number | null;
  attempt_number: number;
  created_at: Date;
  session: IExerciseSession;
}

export interface IProblemStatistic {
  id: number;
  user_id: number;
  factor1: number;
  factor2: number;
  total_attempts: number;
  correct_attempts: number;
  avg_response_time_ms: number;
  last_attempt_at: Date;
  user: IUser;
}
