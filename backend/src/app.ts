import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { json } from "body-parser";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.routes";
import sessionsRoutes from "./routes/sessions.routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/sessions", sessionsRoutes);

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    }
  });
});

export default app;
