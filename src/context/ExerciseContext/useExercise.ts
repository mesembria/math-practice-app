import { useContext } from 'react';
import { ExerciseContext } from './ExerciseContext';
import { ExerciseContextValue } from './types';

export const useExercise = (): ExerciseContextValue => {
  const context = useContext(ExerciseContext);
  
  if (!context) {
    throw new Error(
      'useExercise must be used within an ExerciseProvider. ' +
      'Wrap a parent component in <ExerciseProvider> to fix this error.'
    );
  }
  
  return context;
};

// Export the provider for convenience
export { ExerciseProvider } from './ExerciseContext';
