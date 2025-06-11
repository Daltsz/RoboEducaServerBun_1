// 📡 Importa funções para configurar e iniciar os servidores MQTT e WebSocket
import { startMQTTServers, setupAedes } from './setupBroker.js'
// 🛢️ Importa o cliente Prisma para interagir com o banco de dados
import { PrismaClient } from '@prisma/client'
// 🔐 Importa a função que configura a autorização de publicação no broker
import { setupPublishAuthorization } from './publishHandler.js'

// 🧬 Cria uma instância do Prisma para realizar consultas ao banco
const prisma = new PrismaClient()
// 🚀 Inicializa o broker Aedes (responsável por gerenciar conexões MQTT)
const { aedesServer } = setupAedes()

// 🔒 Configura as regras de autorização para publicações MQTT
setupPublishAuthorization(aedesServer, prisma)
// 🟢 Inicia os servidores TCP e WebSocket para permitir conexões de clientes MQTT
startMQTTServers(aedesServer)