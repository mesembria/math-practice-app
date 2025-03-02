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
  
  // Use DB_PATH environment variable if set, otherwise use the default path
  const dbPath = process.env.DB_PATH || path.join(__dirname, "../../data/math-practice.sqlite");
  console.log(`Using database path: ${dbPath}`);
  
  // Create the directory if it doesn't exist
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return dbPath;
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
  migrations: [path.join(__dirname, "../migrations/*.ts")],
});

// Create data directory if it doesn't exist
if (process.env.NODE_ENV !== "test") {
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}