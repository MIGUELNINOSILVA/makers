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
            return { error: 'Message and session_id are required' };
        }

        // 1. Notify the frontend that the user sent a message
        transmit.broadcast(`chat_${session_id}`, {
            event: 'user_message',
            message,
            timestamp: new Date().toISOString(),
            type: 'user',
            user_id,
        });

        // 2. Notify the frontend that the AI is "typing"
        transmit.broadcast(`chat_${session_id}`, {
            event: 'typing',
            typing: true,
            timestamp: new Date().toISOString(),
        });

        // 3. Send the request to n8n but DO NOT wait for it (no await)
        axios.post(env.get('N8N_URL'), {
            message,
            user_id: user_id || 1,
            session_id,
            timestamp: new Date().toISOString(),
        }).catch(error => {
            console.error('Error contacting n8n:', error.message);
            transmit.broadcast(`chat_${session_id}`, {
                event: 'error_message',
                message: 'The assistant could not process your request. Please try again.',
                timestamp: new Date().toISOString(),
                type: 'error',
            });
            transmit.broadcast(`chat_${session_id}`, {
                event: 'typing',
                typing: false,
                timestamp: new Date().toISOString(),
            });
        });

        return { success: true, message: 'Message sent for processing' };
    }

    // Function to format the message from N8N
    private formatMessage(rawMessage: string) {
        // Detect and process products in list format
        const productPattern = /(\d+)\.\s\*\*(.*?)\*\*\s*-\s\*\*Description\*\*:\s*(.*?)\.\s*-\s\*\*Price\*\*:\s*\$([\d,]+\.?\d*)\s*-\s\*\*Stock\*\*:\s*(\d+)\s*units?\s*available?/gi;
        
        // Extract products
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

        // Extract categories
        const categoryPattern = /###\s*(.*?):/g;
        const categories = [];
        let categoryMatch;
        while ((categoryMatch = categoryPattern.exec(rawMessage)) !== null) {
            categories.push(categoryMatch[1]);
        }

        // Extract introductory and final text
        const introPattern = /^(.*?)(?=###|$)/s;
        const introMatch = rawMessage.match(introPattern);
        const intro = introMatch ? introMatch[1].trim() : '';

        const outroPattern = /¿.*?😊/s; // This regex might need adjustment based on the actual outro text
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
            return { error: 'session_id and message are required' };
        }

        // Stops the "typing" indicator
        transmit.broadcast(`chat_${session_id}`, {
            event: 'typing',
            typing: false,
            timestamp: new Date().toISOString(),
        });

        // Format the message if it contains products
        const isProductList = message.includes('**Description**') && message.includes('**Price**') && message.includes('**Stock**');
        
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
            // Normal message without special formatting
            transmit.broadcast(`chat_${session_id}`, {
                event: 'ai_message',
                message,
                timestamp: new Date().toISOString(),
                type: 'assistant',
                recommendations
            });
        }

        console.log(`Message sent to channel chat_${session_id}`);
        return { success: true };
    }

    public async disconnect({ request }: HttpContext) {
        const { session_id } = request.only(['session_id'])
        if (session_id) {
            transmit.broadcast(`chat_${session_id}`, {
                event: 'user_disconnected',
                message: 'User disconnected',
                timestamp: new Date().toISOString(),
                type: 'system',
            })
        }
        return { success: true }
    }
}