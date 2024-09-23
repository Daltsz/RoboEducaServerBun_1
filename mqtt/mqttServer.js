import aedes from "aedes";
import net from 'net';
import WebSocketStream from "websocket-stream";
import http from 'http';
import { db } from "../database/sqlite";
import bcrypt from 'bcryptjs';


const MQTT_Port = 17243
const wsPort = 8884


export const startMqttServer= () => {
    const aedesServer = aedes()
    const server = net.createServer(aedesServer.handle)

    server.listen(MQTT_Port, () => {
        console.log('AEDES MQTT server started and listening on port', MQTT_Port)
    })

    const httpServer = http.createServer(requestListener)
    websocketStream.createServer({ server: httpServer }, aedesServer.handle)

    httpServer.listen(wsPort, () => {
        console.log('WebSocket server listening on port', wsPort)
    })

    aedesServer.authenticate = (client, username, password, callback) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) =>{
            if(err) {
                console.error('Error to consult DB', err);
                return callback(null, false);
            }

            if(!user || !bcrypt.compare(password.toString(), user.password)){
                return callback(null, false);
            }
            console.log(`Sucess MQTT Client ${username} authenticated`)
            callback(null, true)
        });
    }

    // Eventos MQTT
    aedesServer.on('client', (client) => {
        console.log(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)} connected to aedes broker ${aedesServer.id}`);
     });

    aedesServer.on('clientDisconnect', (client) => {
        console.log(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from aedes broker ${aedesServer.id}`);
    });

    aedesServer.on('subscribe', (subscriptions, client) => {
        console.log(`TOPIC_SUBSCRIBED : MQTT Client ${(client ? client.id : client)} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedesServer.id}`);
    });

    aedesServer.on('unsubscribe', (subscriptions, client) => {
        console.log(`TOPIC_UNSUBSCRIBED : MQTT Client ${(client ? client.id : client)} unsubscribed from topic: ${subscriptions.join(',')} from aedes broker ${aedesServer.id}`);
    });

    aedesServer.on('publish', (packet, client) => {
        if (client) {
            const topic = packet.topic;
            const payload = packet.payload.toString();
            console.log(`MESSAGE_PUBLISHED : MQTT Client ${client.id} has published message on topic "${topic}" with payload "${payload}" to aedes broker ${aedesServer.id}`);
        }
    });

    aedesServer.on('deliver', (packet, client) => {
        if (client) {
            console.log(`MESSAGE_DELIVERED : MQTT Client ${client.id} has received message on topic "${packet.topic}" with payload "${packet.payload.toString('utf8')}"`);
        }
    });

}