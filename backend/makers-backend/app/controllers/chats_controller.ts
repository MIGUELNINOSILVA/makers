// app/controllers/chats_controller.ts

import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import axios from 'axios'

export default class ChatsController {
    public async connect({ request }: HttpContext) {
        const userId = request.input('user_id') || 'anonymous'
        const sessionId = request.input('session_id') || `session-${userId}-${Date.now()}`

        transmit.broadcast(`chat_${sessionId}`, {
            event: 'connection_established',
            timestamp: new Date().toISOString(),
            type: 'system',
        })

        return { success: true, session_id: sessionId }
    }

    public async sendMessage({ request }: HttpContext) {
        const { message, user_id, session_id } = request.only(['message', 'user_id', 'session_id']);

        if (!message || !session_id) {
            return { error: 'Mensaje y session_id son requeridos' };
        }

        // 1. Notifica al frontend que el usuario envió un mensaje
        transmit.broadcast(`chat_${session_id}`, {
            event: 'user_message',
            message,
            timestamp: new Date().toISOString(),
            type: 'user',
            user_id,
        });

        // 2. Notifica al frontend que la IA está "escribiendo"
        transmit.broadcast(`chat_${session_id}`, {
            event: 'typing',
            typing: true,
            timestamp: new Date().toISOString(),
        });

        // 3. Envía la petición a n8n pero NO la esperes (sin await)
        axios.post(env.get('N8N_URL'), {
            message,
            user_id: user_id || 1,
            session_id,
            timestamp: new Date().toISOString(),
        }).catch(error => {
            console.error('Error al contactar n8n:', error.message);
            transmit.broadcast(`chat_${session_id}`, {
                event: 'error_message',
                message: 'El asistente no pudo procesar tu solicitud. Intenta de nuevo.',
                timestamp: new Date().toISOString(),
                type: 'error',
            });
            transmit.broadcast(`chat_${session_id}`, {
                event: 'typing',
                typing: false,
                timestamp: new Date().toISOString(),
            });
        });

        return { success: true, message: 'Mensaje enviado a procesar' };
    }

    // Función para formatear el mensaje de N8N
    private formatMessage(rawMessage: string) {
        // Detectar y procesar productos en formato lista
        const productPattern = /(\d+)\.\s\*\*(.*?)\*\*\s*-\s\*\*Descripción\*\*:\s*(.*?)\.\s*-\s\*\*Precio\*\*:\s*\$([\d,]+\.?\d*)\s*-\s\*\*Stock\*\*:\s*(\d+)\s*unidades?\s*disponibles?/gi;
        
        // Extraer productos
        const products = [];
        let match;
        while ((match = productPattern.exec(rawMessage)) !== null) {
            products.push({
                id: parseInt(match[1]),
                name: match[2],
                description: match[3],
                price: parseFloat(match[4].replace(',', '')),
                stock: parseInt(match[5])
            });
        }

        // Extraer categorías
        const categoryPattern = /###\s*(.*?):/g;
        const categories = [];
        let categoryMatch;
        while ((categoryMatch = categoryPattern.exec(rawMessage)) !== null) {
            categories.push(categoryMatch[1]);
        }

        // Extraer texto introductorio y final
        const introPattern = /^(.*?)(?=###|$)/s;
        const introMatch = rawMessage.match(introPattern);
        const intro = introMatch ? introMatch[1].trim() : '';

        const outroPattern = /¿.*?😊/s;
        const outroMatch = rawMessage.match(outroPattern);
        const outro = outroMatch ? outroMatch[0] : '';

        return {
            type: 'formatted_response',
            intro: intro.replace(/[#*]/g, ''),
            categories,
            products,
            outro,
            raw_message: rawMessage
        };
    }

    public async receiveFromN8N({ request }: HttpContext) {
        const { session_id, message, recommendations = [] } = request.only(['session_id', 'message', 'recommendations']);

        if (!session_id || !message) {
            return { error: 'session_id y message son requeridos' };
        }

        // Detiene el indicador de "escribiendo"
        transmit.broadcast(`chat_${session_id}`, {
            event: 'typing',
            typing: false,
            timestamp: new Date().toISOString(),
        });

        // Formatear el mensaje si contiene productos
        const isProductList = message.includes('**Descripción**') && message.includes('**Precio**') && message.includes('**Stock**');
        
        if (isProductList) {
            const formattedData = this.formatMessage(message);
            
            transmit.broadcast(`chat_${session_id}`, {
                event: 'ai_message_formatted',
                data: formattedData,
                timestamp: new Date().toISOString(),
                type: 'assistant',
                recommendations
            });
        } else {
            // Mensaje normal sin formateo especial
            transmit.broadcast(`chat_${session_id}`, {
                event: 'ai_message',
                message,
                timestamp: new Date().toISOString(),
                type: 'assistant',
                recommendations
            });
        }

        console.log(`Mensaje enviado al canal chat_${session_id}`);
        return { success: true };
    }

    public async disconnect({ request }: HttpContext) {
        const { session_id } = request.only(['session_id'])
        if (session_id) {
            transmit.broadcast(`chat_${session_id}`, {
                event: 'user_disconnected',
                message: 'Usuario desconectado',
                timestamp: new Date().toISOString(),
                type: 'system',
            })
        }
        return { success: true }
    }
}