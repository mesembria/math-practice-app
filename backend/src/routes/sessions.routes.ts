import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller';

const router = Router();

router.post('/', SessionsController.create);
router.get('/:sessionId', SessionsController.getSession);
router.get('/:sessionId/problems/next', SessionsController.getNextProblem);
router.post('/:sessionId/attempts', SessionsController.submitAttempt);
router.get('/:sessionId/attempts', SessionsController.getSessionAttempts);
router.get('/:sessionId/summary', SessionsController.getSessionSummary);

export default router;
