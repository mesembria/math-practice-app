import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const router = Router();

router.get('/', UsersController.list);

export default router;
