// src/controllers/reviews.controller.ts

import { RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { SessionReviewResponse } from '../types/sessionReview.types';
import { getUserPerformanceSummary, getUserSessions } from '../services/reviews';

export class SessionReviewController {
  /**
   * Get a user's session history with summary statistics
   * Handles the GET /api/users/:userId/sessions endpoint
   */
  static getUserSessions: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Parse pagination parameters with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validate parameters
      if (isNaN(parseInt(userId))) {
        res.status(400).json({ 
          error: 'Invalid userId parameter. Must be a number.' 
        });
        return;
      }
      
      if (page < 1 || limit < 1 || limit > 50) {
        res.status(400).json({ 
          error: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 50.' 
        });
        return;
      }
      
      // Verify the user exists
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ 
        where: { id: parseInt(userId) } 
      });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Get user ID as number
      const userIdNum = parseInt(userId);
      
      // Fetch performance summary and session list in parallel for better performance
      const [summary, sessionData] = await Promise.all([
        getUserPerformanceSummary(userIdNum),
        getUserSessions(userIdNum, page, limit)
      ]);
      
      // Combine results into the API response
      const response: SessionReviewResponse = {
        summary,
        sessions: sessionData.sessions,
        pagination: sessionData.pagination
      };
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Error getting user sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

}