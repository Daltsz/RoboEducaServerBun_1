import aedes from 'aedes'
import net from 'net'
import http from 'http'
import websocketStream from 'websocket-stream'


const MQTT_Port = 17243
const wsPort = 8884


const aedesServer = aedes()
const server = net.createServer(aedesServer.handle)
server.listen(MQTT_Port, () => {
    console.log('AEDES MQTT server started and listening on port', MQTT_Port)
})

const requestListener = (req, res) => {
    res.writeHead(200)
    res.end('My first server!')
}

const httpServer = http.createServer(requestListener)
websocketStream.createServer({ server: httpServer }, aedesServer.handle)

httpServer.listen(wsPort, () => {
    console.log('WebSocket server listening on port', wsPort)
})


aedesServer.authorizePublish = (client, packet, callback) => {
    console.log(packet)
    if (packet.topic === 'led_blink') {
        console.log('Message published to topic led_blink:', packet.payload.toString('utf8'))
    } else {
        console.log('Error: Invalid topic')
        return callback(new Error('Wrong topic'))
    }

    callback(null)
}


aedesServer.on('client', (client) => {
    console.log(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)} connected to aedes broker ${aedesServer.id}`)
})

aedesServer.on('clientDisconnect', (client) => {
    console.log(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from aedes broker ${aedesServer.id}`)
})

aedesServer.on('subscribe', (subscriptions, client) => {
    console.log(`TOPIC_SUBSCRIBED : MQTT Client ${(client ? client.id : client)} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedesServer.id}`)
})

aedesServer.on('unsubscribe', (subscriptions, client) => {
    console.log(`TOPIC_UNSUBSCRIBED : MQTT Client ${(client ? client.id : client)} unsubscribed from topic: ${subscriptions.join(',')} from aedes broker ${aedesServer.id}`)
})

aedesServer.on('publish', (packet, client) => {
    if (client) {
        const topic = packet.topic
        const payload = packet.payload.toString()
        console.log(`MESSAGE_PUBLISHED : MQTT Client ${client.id} has published message on topic "${topic}" with payload "${payload}" to aedes broker ${aedesServer.id}`)
    }
})

aedesServer.on('deliver', (packet, client) => {
    if (client) {
        console.log(`MESSAGE_DELIVERED : MQTT Client ${client.id} has received message on topic "${packet.topic}" with payload "${packet.payload.toString('utf8')}"`)
    }
})