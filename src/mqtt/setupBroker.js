// Importa o broker Aedes (gerenciador MQTT)
import aedes from 'aedes'
// Importa o broker Aedes (gerenciador MQTT)
import net from 'net'
import http from 'http'
import websocketStream from 'websocket-stream'
// Importa sistema de logs customizado
import { logInfo, logWarn, logError } from '../utils/logger.js'

// Define as portas utilizadas pelo broker
const MQTT_PORT = 17243 // Porta para conexão MQTT TCP
const WS_PORT = 8884 // Porta para conexão MQTT via WebSocket

// Função que cria e configura uma instância do broker Aedes
export function setupAedes(){
    const aedesServer = aedes() // Cria o servidor Aedes

    // 🔌 Evento disparado quando um cliente conecta ao broker
    aedesServer.on('client', (client) => {
        logInfo(`CLIENT_CONNECTED: MQTT Client ${client?.id} connected to aedes broker ${aedesServer.id}`)
    });
    // ❌ Evento quando um cliente desconecta do broker
    aedesServer.on('clientDisconnect', (client) =>{
        logWarn(`CLIENT_DISCONNECTED: MQTT Client ${client?.id} disconnected from aedes broker ${aedesServer.id}`)
    });
    // 📥 Evento quando um cliente assina um ou mais tópicos
    aedesServer.on('Subscribe', (subscriptions, client) =>{
        logInfo(`TOPIC_SUBSCRIBED: MQTT Client ${client?.id} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedesServer.id}`)
    });
    // 🚫 Evento quando um cliente cancela inscrição de um ou mais tópicos
    aedesServer.on('unsubscribe', (subscriptions, client) =>{
        logWarn(`TOPIC_UNSUBSCRIBED: MQTT Client ${client?.id} unsubscribed from topic: ${subscriptions.join(',')} from aedes broker ${aedesServer.id}`)
    });

    // 📨 Evento quando uma mensagem é publicada no broker
    aedesServer.on('publish', (packet, client) => {
        if (client) {
            logInfo(`Publicação detectada:
              Client: ${client?.id},
              Tópico: ${packet.topic},
              Payload: ${packet.payload.toString()}`)
          const topic = packet.topic
          const payload = packet.payload.toString()
          logInfo(`MESSAGE_PUBLISHED : MQTT Client ${client?.id} has published message on topic "${topic}" with payload "${payload}" to aedes broker ${aedesServer.id}`)
        }
    });

    // ✅ Evento quando uma mensagem é entregue a um cliente
    aedesServer.on('deliver', (packet, client) => {
        if (client) {
            logInfo(`MESSAGE_DELIVERED : MQTT Client ${client?.id} has received message on topic "${packet.topic}" with payload "${packet.payload.toString('utf8')}"`)
        }
    });

    // Retorna o broker configurado
    return {aedesServer}
}

// Função que inicia os servidores MQTT e WebSocket
export function startMQTTServers(aedesServer){
    // 🧷 Cria e inicia servidor TCP (padrão MQTT)
    const tcpServer = net.createServer(aedesServer.handle)
    tcpServer.listen(MQTT_PORT, () => {
        logInfo(` MQTT TCP Rodando na porta ${MQTT_PORT}`)
    });

    // 🌐 Cria servidor HTTP base para o WebSocket
    const httpServer = http.createServer((_, res) =>{
        res.writeHead(200)
        res.end('WebSocket MQTT Broker')
    });

    // Cria servidor WebSocket MQTT com Aedes
    websocketStream.createServer({server: httpServer}, aedesServer.handle)

    // Inicia o servidor WebSocket
    httpServer.listen(WS_PORT, () =>{
        logInfo(`WebSocket MQTT rodando na porta ${WS_PORT}`)
    });
}