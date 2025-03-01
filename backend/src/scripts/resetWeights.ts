// backend/src/scripts/resetWeights.ts
// Script to reset problem weights and statistics while preserving users

import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { ProblemState } from "../models/ProblemState";
import { ProblemStatistic } from "../models/ProblemStatistic";

/**
 * Resets problem weights and statistics for all users or a specific user
 * @param userId Optional user ID to reset data for a specific user only
 */
async function resetUserData(userId?: number) {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized");
    }

    const problemStateRepo = AppDataSource.getRepository(ProblemState);
    const problemStatsRepo = AppDataSource.getRepository(ProblemStatistic);
    
    // Build the query conditions
    const whereCondition = userId ? { userId } : {};
    
    // Delete problem states (weights)
    const deleteWeightsResult = await problemStateRepo.delete(whereCondition);
    console.log(`Deleted ${deleteWeightsResult.affected || 0} problem weights`);
    
    // Delete problem statistics
    const deleteStatsResult = await problemStatsRepo.delete(userId ? { user_id: userId } : {});
    console.log(`Deleted ${deleteStatsResult.affected || 0} problem statistics`);

    // If we're resetting data for all users
    if (!userId) {
      console.log("All users' problem data has been reset");
    } else {
      // Get the user's name for the confirmation message
      const user = await AppDataSource.getRepository(User).findOne({ 
        where: { id: userId },
        select: ['id', 'name']
      });
      console.log(`Problem data has been reset for user: ${user?.name || 'Unknown'} (ID: ${userId})`);
    }
    
    console.log("Reset complete!");
  } catch (error) {
    console.error("Error resetting data:", error);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Handle command-line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npm run reset-weights [-- --user <userId>]");
    console.log("");
    console.log("Options:");
    console.log("  --user <userId>  Reset data for a specific user only");
    console.log("  --help, -h       Show this help message");
    process.exit(0);
  }
  
  const userIdIndex = args.indexOf("--user");
  if (userIdIndex >= 0 && userIdIndex < args.length - 1) {
    const userId = parseInt(args[userIdIndex + 1], 10);
    if (isNaN(userId)) {
      console.error("Error: User ID must be a number");
      process.exit(1);
    }
    await resetUserData(userId);
  } else {
    // Confirm before wiping all data
    if (args.includes("--force") || await confirmAction("Are you sure you want to reset ALL users' problem data? This action cannot be undone.")) {
      await resetUserData();
    } else {
      console.log("Reset canceled.");
    }
  }
}

// Helper function to prompt for confirmation
async function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Use dynamic import for Node.js readline (ESM compatible)
    import('readline').then(readlineModule => {
      const readline = readlineModule.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question(`${message} (y/N): `, (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  });
}

// Run the script
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});