import { Router } from 'express';
import {
  login,
  sendRecovery,
  resetPassword,
} from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/', login);
authRouter.post('/password/recover', sendRecovery);
authRouter.post('/password/reset', resetPassword);