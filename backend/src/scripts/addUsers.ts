// backend/src/scripts/addUsers.ts
// Script to add a new user to the database

import { AppDataSource } from "../config/database";
import { User } from "../models/User";

/**
 * Adds a single user to the database
 * @param name User's name
 * @param isParent Whether the user is a parent (default: false)
 */
async function addUser(name: string, isParent: boolean = false) {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized");
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Check if user already exists
    const existingUser = await userRepository.findOne({ 
      where: { name }
    });
    
    if (existingUser) {
      console.log(`User "${name}" already exists with ID ${existingUser.id}`);
      return;
    }
    
    // Create new user
    const user = new User();
    user.name = name;
    user.is_parent = isParent;
    user.current_level = 1; // Default level
    
    const savedUser = await userRepository.save(user);
    console.log(`Added user "${savedUser.name}" with ID ${savedUser.id}`);
    console.log(`User type: ${isParent ? 'Parent' : 'Child'}`);
    
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  // Show help
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage:");
    console.log("  npm run add-user -- --name <name> [--parent]");
    console.log("");
    console.log("Options:");
    console.log("  --name <name>    The name of the user to add");
    console.log("  --parent         Set the user as a parent (default: false)");
    console.log("  --help, -h       Show this help message");
    process.exit(0);
  }
  
  // Get user name
  const nameIndex = args.indexOf("--name");
  if (nameIndex >= 0 && nameIndex < args.length - 1) {
    const name = args[nameIndex + 1];
    const isParent = args.includes("--parent");
    return { name, isParent };
  }
  
  console.error("Error: Missing required parameter --name");
  console.log("Use --help to see usage information");
  process.exit(1);
}

// Run the function based on arguments
const args = parseArgs();
addUser(args.name, args.isParent).catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});