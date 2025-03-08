import 'reflect-metadata'; // Add this import at the top
import app from "./app";
import { AppDataSource } from "./config/database";

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