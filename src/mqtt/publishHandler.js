// Importa funções de log customizadas (info, erro) para deixar as mensagens padronizadas e coloridas no terminal
import {logInfo, logError} from '../utils/logger.js';

// Define o prefixo de tópico reservado para o pareamento de dispositivos (robôs)
const TOPIC_PAIR_PREFIX = 'pareamento/'

// Cria um Set para rastrear quais tópicos estão sendo processados no momento, evitando processamento duplicado (concorrência)
const processingTopics = new Set()

// Garante que o usuário padrão (id = 1) exista no banco de dados.
// Usado para vincular robôs a um usuário conhecido.
async function initializeUser(prisma) {
    await prisma.user.upsert({
        where: {id:1}, // Verifica se já existe um usuário com id 1
        update: {},  // Se existir, não faz nenhuma atualização
        create: { // Se não existir, cria com os dados abaixo
            id: 1,
            name: 'Ash Ketchum',
            email: 'Ash@pokemon.com'
        }
    });
    logInfo('Usuário padrão garantido no banco de dados.');
}

// Responsável por definir o tópico fixo de um robô a partir de um tópico de pareamento.
// Isso é acionado quando o robô envia uma mensagem para pareamento/MAC com payload "setFixedTopic/..."
async function setFixedTopic(pairTopic, newTopic, prisma, aedesServer) {
     // Se esse tópico já estiver sendo processado, sai da função
    if (processingTopics.has(pairTopic)) return 
    // Adiciona o tópico ao Set para evitar reentrância
    processingTopics.add(pairTopic)
    try{
        // Extrai o MAC do robô a partir do nome do tópico (ex: pareamento/40:f5... → 40:f5...)
        const mac = pairTopic.replace(TOPIC_PAIR_PREFIX, '')
        // Garante que o usuário padrão exista antes de criar o robô
        await initializeUser(prisma)
        // Cadastra ou atualiza o robô no banco de dados
        await prisma.robot.upsert({
            where: {mac}, // Busca pelo MAC do robô
            update: {topic: newTopic}, // Atualiza o tópico se já existir
            create: { // Cria um novo robô se não existir
                mac,
                topic: newTopic,
                name: `Robot-${mac}`,
                userId: 1
            }
        });
        logInfo(`Robô ${mac} pareado com tópico fixo '${newTopic}'.`);
        // Publica uma mensagem vazia com retain=true para limpar qualquer mensagem anterior retida no tópico de pareamento
        aedesServer.publish({ topic: pairTopic, payload: '', retain: true}, () =>{
            logInfo(`Mensagem retida limpa no tópico de pareamento '${pairTopic}'.`);
        })
        // Aguarda 300ms e publica o novo tópico que o robô deve usar
        setTimeout(() => {
            aedesServer.publish({topic: pairTopic, payload: newTopic, retain: false}, () => {
                logInfo(`Novo tópico '${newTopic}' enviado ao robô ${mac} via tópico '${pairTopic}'.`);
            })
        }, 300);
    } catch (err){
        // Caso ocorra algum erro no pareamento, exibe no log
        logError(`[setFixedTopic] Erro: ${err}`)
    }finally{
        // Remove o tópico do Set, liberando-o para um novo processamento no futuro
        processingTopics.delete(pairTopic)
    }
}

// Função que intercepta todas as publicações feitas no broker e autoriza ou nega conforme a lógica de segurança
export function setupPublishAuthorization(aedesServer, prisma){
    aedesServer.authorizePublish  = async (client, packet, callback) => {
        // Extrai o tópico e o conteúdo da mensagem publicada
        const topic = packet.topic
        const payload = packet.payload.toString()
        // 🔐 Caso especial: tentativa de pareamento via tópico "pareamento/MAC"
        if(topic.startsWith(TOPIC_PAIR_PREFIX)){
            // Verifica se o payload segue o formato esperado
            if(payload.startsWith('setFixedTopic/')){
                // Extrai o novo tópico que o robô quer parear
                const newTopic = payload.replace('setFixedTopic/', '').replace(';', '')
                // Executa o pareamento
                await setFixedTopic(topic, newTopic, prisma, aedesServer)
                // Loga o sucesso e permite a publicação
                logInfo(`Pareamento processado para ${client?.id} com tópico '${newTopic}'.`);
                return callback(null)
            }
            // Se o payload for inválido, recusa a publicação
            return callback(new Error('Tópico de pareamento inválido'))
        }
        // 🔒 Caso comum: publicação normal fora do pareamento
        try{
            // Busca no banco de dados o robô pelo client.id (que equivale ao MAC)
            const robot = await prisma.robot.findUnique({where: {mac: client?.id}})
            // Se o robô existe e está publicando no seu tópico fixo → ok
            if (robot && topic === robot.topic){
                logInfo(`Publicação autorizada para robô ${client?.id} no tópico '${topic}'.`);
                return callback(null)
            }
            // Caso contrário, bloqueia a publicação
            return callback(new Error('Tópico não autorizado'))
        } catch (err){
            logError(`[authorizePublish] Erro: ${err}`)
            return callback(new Error('Erro interno'))
        }
    }
}


