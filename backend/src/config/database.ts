// src/config/database.ts
import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { User } from "../models/User";
import { ExerciseSession } from "../models/ExerciseSession";
import { ProblemAttempt } from "../models/ProblemAttempt";
import { ProblemStatistic } from "../models/ProblemStatistic";
import { ProblemState } from "../models/ProblemState";

// Define the database path
const getDbPath = () => {
  if (process.env.NODE_ENV === "test") {
    return ":memory:";
  }
  
  const dbPath = process.env.DB_PATH || path.join(__dirname, "../../data/math-practice.sqlite");
  console.log(`Using database path: ${dbPath}`);
  
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return dbPath;
};

// Determine migrations path based on environment
const getMigrationsPath = () => {
  // In development, use TypeScript files
  if (process.env.NODE_ENV === "development") {
    return path.join(__dirname, "../migrations/**/*.ts");
  }
  
  // In production, use compiled JavaScript files
  return path.join(__dirname, "../migrations/**/*.js");
};

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: getDbPath(),
  entities: [
    User,
    ExerciseSession,
    ProblemAttempt,
    ProblemStatistic,
    ProblemState
  ],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  migrations: [getMigrationsPath()],
  migrationsTableName: "migrations",
  migrationsRun: false, // We'll run migrations manually
});

// Create data directory if it doesn't exist
if (process.env.NODE_ENV !== "test") {
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}