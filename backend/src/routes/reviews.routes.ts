import { Router } from 'express';
import { SessionReviewController } from '../controllers/reviews.controller';

const router = Router();

// Route for getting a user's session history with summary statistics
router.get('/users/:userId/sessions', SessionReviewController.getUserSessions);

export default router;