// import aedes from 'aedes'
// import net from 'net'
// import http from 'http'
// import websocketStream from 'websocket-stream'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient();
// const MQTT_Port = 17243;
// const wsPort = 8884;
// const aedesServer = aedes();
// const topicPairPrefix = "pareamento/";
// let processingTopics = new Set();

// const server = net.createServer(aedesServer.handle)
// server.listen(MQTT_Port, () => {
//     console.log('AEDES MQTT server started and listening on port', MQTT_Port)
// })

// const requestListener = (req, res) => {
//     res.writeHead(200)
//     res.end('My first server!')
// }

// const httpServer = http.createServer(requestListener)
// websocketStream.createServer({ server: httpServer }, aedesServer.handle)

// httpServer.listen(wsPort, () => {
//     console.log('WebSocket server listening on port', wsPort)
// })



// async function initializeUser() {
//     await prisma.user.upsert({
//       where: { id: 1 },
//       update: {}, // Não faz nada se o usuário já existir
//       create: {
//         id: 1,
//         name: "Ash Ketchum",
//         email: "Ash@pokemon.com"
//       },
//     });
//   }



// async function setFixedTopic(pairTopic, newTopic) {
//     console.log("Iniciando setFixedTopic com pairTopic:", pairTopic, "e newTopic:", newTopic);
//     console.log("ENTROU NO SET FIXED TOPIC")
//     if (processingTopics.has(pairTopic)) {
//         console.log(`Processamento já em andamento para o tópico: ${pairTopic}`);
//         return;
//     }
//     processingTopics.add(pairTopic);
//     console.log(`Iniciando processamento para ${pairTopic}`);
//     console.log(`olha o topico de pareamento ai ${pairTopic}`)
//     console.log(`olha o new topic ${newTopic}`)
//     try {
//         const mac = pairTopic.replace("pareamento/", "")
        
//         await initializeUser();
//         await prisma.robot.upsert({
//             where: { mac },
//             update: { topic: newTopic },
//             create: { mac, topic: newTopic, name: `Robot-${mac}`, userId: 1 } // Assumindo userId como 1 para testes
//         });
//         console.log(`Publicando mensagem vazia para limpar o tópico ${pairTopic}`);
//         aedesServer.publish({
//             topic: pairTopic,
//             payload: "",
//             retain: true
//         }, () => {
//             console.log(`Mensagem retida no tópico ${pairTopic} foi limpa.`);
//         });

//         setTimeout(() => {
//             console.log(`Enviando novo tópico: ${newTopic} para o tópico ${pairTopic}`);
//             aedesServer.publish({
//                 topic: pairTopic,
//                 payload: newTopic,
//                 retain: false
//             }, () => {
//                 console.log(`Mensagem de confirmação enviada para ESP8266 com MAC ${mac}`);
//             });
//         }, 200);
//         console.log(`Fixed topic for Robot with MAC ${mac} set to ${newTopic}`);
//     } catch (error) {
//         console.error(`Erro ao processar setFixedTopic para ${pairTopic}:`, error);
//     } finally {
//         // Remover o tópico de pareamento do processamento ativo
//         processingTopics.delete(pairTopic);
//         console.log(`Processamento concluído para ${pairTopic}`);
//     }
// }

// aedesServer.authorizePublish = async (client, packet, callback) => {
//     const messageId = `${client.id}-${packet.topic}-${packet.payload.toString()}`;
//     console.log(`"olha o client ${client}`)
//     const client_id = client.id;
//     const topic = packet.topic
//     const payload = packet.payload.toString('utf8');
//     console.log(`authorizePublish disparado:
//         Client: ${client.id},
//         Tópico: ${topic},
//         Payload: ${payload}`);
//     console.log(packet)
//     console.log(`client_id ${client_id}`)
//     console.log(`topic ${topic}`)
//     if (topic.startsWith(topicPairPrefix)) {
//         console.log(`Mensagem de pareamento publicada no tópico ${topic}:`, payload);
//         console.log(typeof payload)
//         if (payload.startsWith("setFixedTopic/")) {
//             const newTopic = payload.replace("setFixedTopic/", "").replace(";","");
//             // const newTopic = newTop.replace(";","")
//             console.log(`Atualizando tópico fixo: ${newTopic}`);
//             console.log(`Interceptada e processada mensagem: ${payload}`);
//             await setFixedTopic(topic, newTopic);
//             return callback(null);
//         }
//         return callback(new Error('Tópico de pareamento inválido'));
//         // return callback(new Error('Tópico de pareamento inválido'));
//     }

//     try {
//         // Verifica o tópico fixo para este client_id no banco de dados
//         const robot  = await prisma.robot.findUnique({ where: { mac:"40:f5:20:28:dd:c7"}});

//         if (robot) {
//             if (topic === robot.topic) {
//                 console.log(`Mensagem publicada no tópico fixo ${topic}: ${payload}`);
//                 return callback(null); // Permite a publicação
//             } else {
//                 console.log(`Erro: Client ${client.id} tentou publicar em um tópico diferente do fixo.`);
//                 return callback(new Error('Tópico não autorizado'));
//             }
//         } else {
//             console.log(`Erro: Client ${client.id} não possui tópico fixo registrado.`);
//             return callback(new Error('Client não autorizado para este tópico'));
//         }

//         // if (topic.startsWith('pareamento/') || topic === 'led_blink') {
//         //     console.log(`Message published to topic: ${topic}`, packet.payload.toString('utf8'))
//         // } else {
//         //     console.log('Error: Invalid topic')
//         //     return callback(new Error('Wrong topic'))
//         // }

//         // callback(null)
//     } catch (error) {
//         console.error('Erro ao verificar o tópico no banco de dados:', error);
//         callback(new Error('Erro ao autorizar o tópico'));
//     }
// }


// aedesServer.on('client', (client) => {
//     console.log(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)} connected to aedes broker ${aedesServer.id}`)
// })

// aedesServer.on('clientDisconnect', (client) => {
//     console.log(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from aedes broker ${aedesServer.id}`)
// })

// aedesServer.on('subscribe', (subscriptions, client) => {
//     console.log(`TOPIC_SUBSCRIBED : MQTT Client ${(client ? client.id : client)} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedesServer.id}`)
// })

// aedesServer.on('unsubscribe', (subscriptions, client) => {
//     console.log(`TOPIC_UNSUBSCRIBED : MQTT Client ${(client ? client.id : client)} unsubscribed from topic: ${subscriptions.join(',')} from aedes broker ${aedesServer.id}`)
// })

// aedesServer.on('publish', (packet, client) => {
//     if (client) {
//         console.log(`Publicação detectada:
//             Client: ${client.id},
//             Tópico: ${packet.topic},
//             Payload: ${packet.payload.toString()}`);
//         const topic = packet.topic
//         const payload = packet.payload.toString()
//         console.log(`MESSAGE_PUBLISHED : MQTT Client ${client.id} has published message on topic "${topic}" with payload "${payload}" to aedes broker ${aedesServer.id}`)
//     }
// })

// aedesServer.on('deliver', (packet, client) => {
//     if (client) {
//         console.log(`MESSAGE_DELIVERED : MQTT Client ${client.id} has received message on topic "${packet.topic}" with payload "${packet.payload.toString('utf8')}"`)
//     }
// })