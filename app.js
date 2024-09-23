import express from 'express';
import { initDatabase } from './database/sqlite.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { autenticateToken } from './middlewares/authMiddleware.js';
import { startMqttServer } from './mqtt/mqttServer.js';

const app = express()
const PORT = 3000

app.use(express.json());

app.post('/register', registerUser);
app.post('/login', loginUser);

app.get('/mqtt-connection', autenticateToken, (req, res) => {
    res.json({message: 'Conection MQTT Lost', user: req.user });
});

initDatabase();

app.listen(PORT, () =>{
    console.log(`Http Server Run in port ${PORT}`)

});

startMqttServer();