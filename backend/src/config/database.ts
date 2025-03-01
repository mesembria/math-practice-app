import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { User } from "../models/User";
import { ExerciseSession } from "../models/ExerciseSession";
import { ProblemAttempt } from "../models/ProblemAttempt";
import { ProblemStatistic } from "../models/ProblemStatistic";
import { ProblemState } from "../models/ProblemState";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.NODE_ENV === "test" 
    ? ":memory:" 
    : path.join(__dirname, "../../data/math-practice.sqlite"),
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
