import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import axios from 'axios'

export default class ChatsController {

    /**
       * Manejar conexión WebSocket
       */
    public async connect({ request, response }: HttpContext) {
        // 1. Obtenemos los datos de la petición.
        const userId = request.input('user_id') || 'anonymous'
        const sessionId = request.input('session_id') || `session-${userId}-${Date.now()}`

        // 2. No es necesario llamar a `transmit.authorize()`. 
        //    La autorización ya ocurrió automáticamente gracias a tu archivo `config/transmit.ts`.

        // 3. Simplemente enviamos el mensaje de bienvenida al canal correcto.
        //    Añadimos de nuevo el nombre del evento 'connection_established'.
        transmit.broadcast(`chat_${sessionId}`, 'connection_established', {
            message: '¡Hola! Soy Sparky, tu asesor de Makers Tech. ¿En qué puedo ayudarte hoy? 🚀',
            timestamp: new Date().toISOString(),
            type: 'system'
        })

        // 4. Devolvemos el session_id para que el cliente lo use.
        return { success: true, session_id: sessionId }
    }

    /**
   * Recibir mensaje del cliente y enviarlo a N8N
   */
    public async sendMessage({ request }: HttpContext) {
        const { message, user_id, session_id } = request.only(['message', 'user_id', 'session_id'])

        if (!message || !session_id) {
            return { error: 'Mensaje y session_id son requeridos' }
        }

        try {
            // 1. Mostrar "escribiendo..." al cliente
            transmit.broadcast(`chat_${session_id}`, 'typing', {
                typing: true,
                timestamp: new Date().toISOString()
            })

            // 2. Enviar el mensaje del usuario de vuelta (confirmación)
            transmit.broadcast(`chat_${session_id}`, 'user_message', {
                message,
                timestamp: new Date().toISOString(),
                type: 'user',
                user_id
            })

            // 3. Enviar a N8N webhook
            const n8nResponse = await axios.post('http://localhost:5678/webhook/f2e5a7b8-a1b9-4d3c-8e6f-7d1a9b2c3d4e', {
                message,
                user_id: user_id || 1,
                session_id,
                timestamp: new Date().toISOString()
            }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            // 4. Quitar "escribiendo..."
            transmit.broadcast(`chat_${session_id}`, 'typing', {
                typing: false,
                timestamp: new Date().toISOString()
            })

            // 5. Enviar respuesta de la IA al cliente
            if (n8nResponse.data && n8nResponse.data.response) {
                transmit.broadcast(`chat_${session_id}`, 'ai_message', {
                    message: n8nResponse.data.response,
                    timestamp: new Date().toISOString(),
                    type: 'assistant',
                    recommendations: n8nResponse.data.recommendations || []
                })
            }

            return {
                success: true,
                message: 'Mensaje enviado correctamente'
            }

        } catch (error) {
            console.error('Error sending message to N8N:', error)

            // Quitar "escribiendo..." en caso de error
            transmit.broadcast(`chat_${session_id}`, 'typing', {
                typing: false,
                timestamp: new Date().toISOString()
            })

            // Enviar mensaje de error al cliente
            transmit.broadcast(`chat_${session_id}`, 'error_message', {
                message: 'Lo siento, hubo un problema técnico. Por favor intenta de nuevo.',
                timestamp: new Date().toISOString(),
                type: 'error'
            })

            return {
                success: false,
                error: 'Error procesando el mensaje'
            }
        }
    }

    /**
     * Endpoint para que N8N envíe respuestas directamente (alternativo)
     */
    public async receiveFromN8N({ request }: HttpContext) {
        const { session_id, message, type, user_id } = request.only(['session_id', 'message', 'type', 'user_id'])

        if (!session_id || !message) {
            return { error: 'session_id y message son requeridos' }
        }

        // Enviar mensaje al cliente específico
        transmit.broadcast(`chat_${session_id}`, 'ai_message', {
            message,
            timestamp: new Date().toISOString(),
            type: type || 'assistant',
            user_id
        })

        return { success: true }
    }

    /**
     * Desconectar usuario
     */
    public async disconnect({ request }: HttpContext) {
        const { session_id } = request.only(['session_id'])

        if (session_id) {
            transmit.broadcast(`chat_${session_id}`, 'user_disconnected', {
                message: 'Usuario desconectado',
                timestamp: new Date().toISOString(),
                type: 'system'
            })
        }

        return { success: true }
    }
}