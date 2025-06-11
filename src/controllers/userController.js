import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
// GET /api/users
export async function listUsers(_, res) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    res.json(users);
}


// GET /api/users/:id
export async function getUser(req, res) {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
    user ? res.json(user) : res.status(404).json({ error: 'Usuário não encontrado' });
}


// GET /api/users/:id/me
export async function getUserWithRobots(req, res) {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        robots: { select: { id: true, name: true, topic: true, mac: true } },
      },
    });
    user ? res.json(user) : res.status(404).json({ error: 'Usuário não encontrado' });
}


// POST /api/users
export async function createUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Campos obrigatórios' });
  
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(200).json(existing); // já existe
  
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hash } });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
}


// PUT /api/users/:id
export async function updateUser(req, res) {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;
  
    try {
      const data = { name, email };
      if (password) data.password = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.update({ where: { id }, data });
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
    const id = Number(req.params.id);
    try {
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'Usuário deletado' });
    } catch {
      res.status(200).json({ message: 'Usuário não existe (já estava OK)' });
    }
  }

  
