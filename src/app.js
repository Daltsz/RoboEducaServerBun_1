import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import express from 'express';
import { userRouter } from './routes/userRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';

import { authenticateToken } from './middlewares/authMiddleware.js'; // nova grafia
// import { startMqttServer } from './mqtt/mqttServer.js';

const app = express()
// const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/auth',  authRouter);
app.use('/api/admin', adminRouter);

app.get('/mqtt-connection', authenticateToken, (req, res) => {
    res.json({ message: 'Conection MQTT Lost', user: req.user });
  });


app.get('/', (req, res) => {
  res.send('🚀 API está rodando! Tudo certo por aqui!');
});

app.get('/api', (req, res) => {
  res.json({message: 'API Online!'});
});



export default app;

// app.listen(PORT, () => {
//     console.log(`HTTP server running on port ${PORT}`);
//   });

// startMqttServer();