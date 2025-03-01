import app from "./app";
import { AppDataSource } from "./config/database";
import { User } from "./models/User";

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connection initialized");

    // Run migrations
    await AppDataSource.runMigrations();
    console.log("Database migrations completed");

    // Create a test user if none exists
    const userRepo = AppDataSource.getRepository(User);
    const userCount = await userRepo.count();
    if (userCount === 0) {
      await userRepo.save({
        name: 'Test User',
        is_parent: false,
        current_level: 1
      });
      console.log("Created test user");
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  try {
    await AppDataSource.destroy();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
