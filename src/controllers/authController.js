import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const jwtOpts = { expiresIn: '7d' };

// const SECRET_KEY = 'my_secret_key'


// POST /api/auth
export async function login(req, res) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      jwtOpts
    );
    res.json({ token });
}


// POST /api/auth/password/recover
export async function sendRecovery(req, res) {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'OK (e‑mail enviado se existir)' });
  
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 h
    await prisma.user.update({
      where: { email },
      data: { resetToken: code, resetExpires: expires },
    });
  
    const transport = nodemailer.createTransport({ jsonTransport: true }); // console only
    await transport.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      text: `Seu código de recuperação: ${code}`,
    });

    console.log("Código de recuperação de senha:", code);
  
    res.json({ message: 'E‑mail enviado' });
}


// POST /api/auth/password/reset
export async function resetPassword(req, res) {
    const { email, code, new_password } = req.body;
    if (new_password.length < 8)
      return res.status(400).json({ error: 'Senha deve ter ao menos 8 caracteres' });
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== code || user.resetExpires < new Date())
      return res.status(400).json({ error: 'Código inválido ou expirado' });
  
    const hash = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hash, resetToken: null, resetExpires: null },
    });
    res.json({ message: 'Senha redefinida' });
  }


 
