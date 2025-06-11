import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();
export const adminRouter  = Router();

console.log('adminRoutes carregado!');

adminRouter.use(authenticateToken, requireAdmin)

adminRouter.get('/ping', (req, res) => {
    res.json({ message: 'Admin funcionando' });
  });


adminRouter.get('/dashboard', async (req, res) => {
    const users = await prisma.user.findMany({
        select:{
            id: true,
            name: true,
            email: true,
            isAdmin: true,
        },
    });
    res.json({users})
});

