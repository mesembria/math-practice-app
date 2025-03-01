import { RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export class UsersController {
  static list: RequestHandler = async (req, res) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: ['id', 'name', 'is_parent'], // Only return necessary fields
        order: { name: 'ASC' } // Sort by name
      });
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
