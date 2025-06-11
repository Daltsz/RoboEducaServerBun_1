import { Router } from 'express';
import {
  listUsers,
  getUser,
  getUserWithRobots,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export const userRouter = Router();

userRouter.get('/', listUsers);
userRouter.get('/:id', getUser);
userRouter.get('/:id/me', getUserWithRobots);

userRouter.post('/', createUser);
userRouter.put('/:id', authenticateToken, updateUser);
userRouter.delete('/:id', authenticateToken, deleteUser);