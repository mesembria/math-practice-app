import { useState, useCallback } from 'react';

// Types for the encouragement data from the API
export interface EncouragementData {
  wasIncorrectBefore?: boolean;
  isFirstTimeCorrect?: boolean;
  previousResponseTime?: number | null;
  averageResponseTime?: number | null;
  timeImprovement?: number | null;
  correctStreak?: number;
  sessionProgress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Different types of encouragement messages
export enum MessageType {
  CORRECT_AFTER_MISTAKE = 'correctAfterMistake',
  FIRST_TIME_MASTERY = 'firstTimeMastery',
  FASTER_THAN_LAST_TIME = 'fasterThanLastTime',
  SIGNIFICANT_IMPROVEMENT = 'significantImprovement',
  FASTER_THAN_AVERAGE = 'fasterThanAverage',
  SESSION_PROGRESS = 'sessionProgress',
  RECOVERY_RECOGNITION = 'recoveryRecognition',
  CONSECUTIVE_CORRECT = 'consecutiveCorrect',
}

// Message template structure
interface MessageTemplate {
  text: string;
  emoji: string;
}

// Collection of message templates by type
const messageTemplates: Record<MessageType, MessageTemplate[]> = {
  [MessageType.CORRECT_AFTER_MISTAKE]: [
    { text: "You got it! Amazing job!", emoji: "🌟" },
    { text: "Wow! You fixed it! Super smart!", emoji: "🧠" },
    { text: "Look at you go! You figured it out!", emoji: "✨" }
  ],
  [MessageType.FIRST_TIME_MASTERY]: [
    { text: "First time getting this one right! Awesome!", emoji: "🏆" },
    { text: "You just mastered a new problem! Woohoo!", emoji: "🎯" },
    { text: "New achievement unlocked! You're a star!", emoji: "⭐" }
  ],
  [MessageType.FASTER_THAN_LAST_TIME]: [
    { text: "Speedy work! Faster than last time!", emoji: "🚀" },
    { text: "Zoom! You're getting quicker!", emoji: "⚡" },
    { text: "Wow! Your brain is working super fast today!", emoji: "🏎️" }
  ],
  [MessageType.SIGNIFICANT_IMPROVEMENT]: [
    { text: "Incredible! 20% faster than before!", emoji: "🚀" }, // 20-29%
    { text: "Amazing speed! 30% faster!", emoji: "🏎️" }, // 30-39%
    { text: "Super sonic! 40% faster!", emoji: "⚡" }, // 40-49%
    { text: "Lightning fast! 50% faster!", emoji: "💨" }  // 50%+
  ],
  [MessageType.FASTER_THAN_AVERAGE]: [
    { text: "Quicker than usual! Great job!", emoji: "⏱️" },
    { text: "Speedier than your average! Wow!", emoji: "🏁" },
    { text: "You're on fire today! So fast!", emoji: "🔥" }
  ],
  [MessageType.SESSION_PROGRESS]: [
    { text: "Halfway there! You're doing great!", emoji: "🏔️" }, // 50%
    { text: "Almost finished! Keep going!", emoji: "🏁" }, // 80%
    { text: "Final stretch! You can do it!", emoji: "🎬" }  // 90%
  ],
  [MessageType.RECOVERY_RECOGNITION]: [
    { text: "Back on track! Way to go!", emoji: "🚂" },
    { text: "Great comeback! You're crushing it!", emoji: "💪" },
    { text: "Look at you bounce back! Awesome!", emoji: "🦘" }
  ],
  [MessageType.CONSECUTIVE_CORRECT]: [
    { text: "5 correct in a row! You're on fire!", emoji: "🔥" },
    { text: "High five! That's 5 correct answers!", emoji: "✋" },
    { text: "Wow! 5 perfect answers in a row!", emoji: "🎯" }
  ]
};

// Configuration for the hook
interface EncouragementConfig {
  displayDuration?: number; // Duration to show message in ms
  significantImprovementThresholds?: number[]; // Thresholds for time improvement
  consecutiveCorrectThreshold?: number; // Number of consecutive correct answers needed
}

const defaultConfig: EncouragementConfig = {
  displayDuration: 2000, // 2 seconds
  significantImprovementThresholds: [20, 30, 40, 50], // 20%, 30%, 40%, 50%
  consecutiveCorrectThreshold: 5 // 5 consecutive correct
};

// The hook interface
interface UseEncouragementMessages {
  message: string | null;
  isVisible: boolean;
  hideMessage: () => void;
  processEncouragementData: (data: EncouragementData | null) => void;
}

/**
 * Custom hook for managing encouragement messages
 */
export const useEncouragementMessages = (
  config: EncouragementConfig = {}
): UseEncouragementMessages => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const mergedConfig = { ...defaultConfig, ...config };

  // Helper to get a random message from a template array
  const getRandomMessage = useCallback((templates: MessageTemplate[]): string => {
    const index = Math.floor(Math.random() * templates.length);
    const template = templates[index];
    return `${template.emoji} ${template.text}`;
  }, []);

  // Get the message for significant time improvement based on the percentage
  const getSignificantImprovementMessage = useCallback((improvement: number): string => {
    const thresholds = mergedConfig.significantImprovementThresholds || [];
    const templates = messageTemplates[MessageType.SIGNIFICANT_IMPROVEMENT];
    
    // Find the appropriate message based on improvement percentage
    // Start from the end to find the highest threshold that's less than the improvement
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (improvement >= thresholds[i]) {
        // Replace the threshold placeholder in the message if needed
        const template = templates[i] || templates[0];
        return `${template.emoji} ${template.text.replace(
          thresholds[i].toString(),
          Math.floor(improvement).toString()
        )}`;
      }
    }
    
    // Fallback to the first message
    return getRandomMessage(templates);
  }, [mergedConfig.significantImprovementThresholds, getRandomMessage]);

  // Get the message for session progress based on the percentage
  const getSessionProgressMessage = useCallback((percentage: number): string | null => {
    const templates = messageTemplates[MessageType.SESSION_PROGRESS];
    
    if (percentage >= 90) {
      return getRandomMessage([templates[2]]); // Final stretch message
    } else if (percentage >= 80) {
      return getRandomMessage([templates[1]]); // Almost finished message
    } else if (percentage >= 50 && percentage < 51) {
      // Only show halfway message when very close to 50% to avoid showing too frequently
      return getRandomMessage([templates[0]]); // Halfway message
    }
    
    return null;
  }, [getRandomMessage]);

  // Select the encouragement message based on priority order
  const selectEncouragementMessage = useCallback((data: EncouragementData): string | null => {
    if (!data) return null;
    
    // 1. Correct After Previous Mistake - highest priority
    if (data.wasIncorrectBefore) {
      return getRandomMessage(messageTemplates[MessageType.CORRECT_AFTER_MISTAKE]);
    }
    
    // 2. First-Time Mastery
    if (data.isFirstTimeCorrect) {
      return getRandomMessage(messageTemplates[MessageType.FIRST_TIME_MASTERY]);
    }
    
    // 3. Faster Than Last Time with Significant Improvement
    if (data.timeImprovement && data.timeImprovement > mergedConfig.significantImprovementThresholds![0]) {
      return getSignificantImprovementMessage(data.timeImprovement);
    }
    
    // 4. Faster Than Last Time (any improvement)
    if (data.timeImprovement && data.timeImprovement > 0) {
      return getRandomMessage(messageTemplates[MessageType.FASTER_THAN_LAST_TIME]);
    }
    
    // 5. Faster Than Average
    if (data.averageResponseTime && data.previousResponseTime && 
        data.previousResponseTime < data.averageResponseTime) {
      return getRandomMessage(messageTemplates[MessageType.FASTER_THAN_AVERAGE]);
    }
    
    // 6. Session Progress (milestone reached)
    if (data.sessionProgress) {
      const progressMessage = getSessionProgressMessage(data.sessionProgress.percentage);
      if (progressMessage) {
        return progressMessage;
      }
    }
    
    // 7. Recovery Recognition (after a mistake)
    // This is for when they've recovered from previous mistakes and are now getting answers correct
    if (data.correctStreak && data.correctStreak >= 2 && data.correctStreak < mergedConfig.consecutiveCorrectThreshold!) {
      return getRandomMessage(messageTemplates[MessageType.RECOVERY_RECOGNITION]);
    }
    
    // 8. Consecutive Correct Answers
    if (data.correctStreak && data.correctStreak >= mergedConfig.consecutiveCorrectThreshold!) {
      return getRandomMessage(messageTemplates[MessageType.CONSECUTIVE_CORRECT]);
    }
    
    return null;
  }, [
    getRandomMessage,
    getSignificantImprovementMessage,
    getSessionProgressMessage,
    mergedConfig.consecutiveCorrectThreshold,
    mergedConfig.significantImprovementThresholds
  ]);

  // Process the encouragement data and show a message if applicable
  const processEncouragementData = useCallback((data: EncouragementData | null) => {
    if (!data) {
      setMessage(null);
      setIsVisible(false);
      return;
    }
    
    const selectedMessage = selectEncouragementMessage(data);
    
    if (selectedMessage) {
      setMessage(selectedMessage);
      setIsVisible(true);
      
      // Auto-hide the message after displayDuration
      setTimeout(() => {
        setIsVisible(false);
      }, mergedConfig.displayDuration);
    } else {
      setMessage(null);
      setIsVisible(false);
    }
  }, [selectEncouragementMessage, mergedConfig.displayDuration]);

  // Manually hide the message
  const hideMessage = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    message,
    isVisible,
    hideMessage,
    processEncouragementData
  };
};

export default useEncouragementMessages;