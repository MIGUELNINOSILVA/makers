<template>
    <div class="fixed bottom-5 right-5 z-50">
        <!-- Chat Window -->
        <div v-if="isOpen"
            class="w-[calc(100vw-40px)] sm:w-96 h-[70vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right"
            :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'">
            <!-- Header -->
            <header
                class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl flex-shrink-0">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-10 h-10 bg-indigo-500 rounded-full"></div>
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full">
                        </div>
                    </div>
                    <div>
                        <h2 class="font-bold text-gray-800">Asistente IA</h2>
                        <p class="text-xs text-green-600">En línea</p>
                    </div>
                </div>
                <button @click="toggleChat"
                    class="p-2 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </header>

            <!-- Messages Area -->
            <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-4">
                <div v-for="(message, index) in messages" :key="index" class="flex"
                    :class="message.type === 'user' ? 'justify-end' : 'justify-start'">

                    <!-- Mensaje normal -->
                    <div v-if="message.format_type !== 'formatted_response'" class="max-w-[80%] px-4 py-2 rounded-2xl"
                        :class="{
                            'bg-indigo-600 text-white rounded-br-lg': message.type === 'user',
                            'bg-gray-200 text-gray-800 rounded-bl-lg': message.type === 'assistant',
                            'bg-yellow-100 text-yellow-800 rounded-lg text-center w-full': message.type === 'system',
                            'bg-red-100 text-red-800 rounded-lg': message.type === 'error'
                        }">
                        <p class="text-sm">{{ message.message }}</p>
                    </div>

                    <!-- Mensaje de productos formateado -->
                    <div v-else class="w-full max-w-full">
                        <div class="bg-gray-50 rounded-2xl p-4 space-y-4">
                            <!-- Texto introductorio -->
                            <div v-if="message.data.intro" class="text-sm text-gray-700 mb-3">
                                {{ message.data.intro }}
                            </div>

                            <!-- Productos por categoría -->
                            <div v-for="category in message.data.categories" :key="category" class="space-y-3">
                                <h3 class="font-bold text-indigo-600 text-sm border-b border-indigo-200 pb-1">
                                    {{ category }}
                                </h3>

                                <div class="space-y-2">
                                    <div v-for="product in getProductsByCategory(category, message.data.products)"
                                        :key="product.id"
                                        class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start mb-2">
                                            <h4 class="font-semibold text-gray-800 text-sm">{{ product.name }}</h4>
                                            <span class="text-lg font-bold text-green-600">${{
                                                formatPrice(product.price) }}</span>
                                        </div>
                                        <p class="text-xs text-gray-600 mb-2">{{ product.description }}</p>
                                        <div class="flex justify-between items-center">
                                            <span class="text-xs"
                                                :class="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'">
                                                {{ product.stock }} disponibles
                                            </span>
                                            <button
                                                class="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition-colors">
                                                Ver más
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Texto de cierre -->
                            <div v-if="message.data.outro"
                                class="text-sm text-gray-700 mt-4 pt-3 border-t border-gray-200">
                                {{ message.data.outro }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isLoading" class="flex justify-start">
                    <div
                        class="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-2 flex items-center space-x-1">
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style="animation-delay: 0s;"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style="animation-delay: 0.2s;"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style="animation-delay: 0.4s;"></span>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <footer class="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex-shrink-0">
                <form @submit.prevent="sendMessage" class="flex items-center space-x-2">
                    <input v-model="newMessage" type="text" placeholder="Escribe tu mensaje..."
                        class="w-full px-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        :disabled="isLoading" />
                    <button type="submit"
                        class="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        :disabled="isLoading || !newMessage.trim()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </footer>
        </div>

        <!-- Floating Action Button (FAB) -->
        <button @click="toggleChat"
            class="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-transform duration-200 hover:scale-110">
            <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>
</template>

<script>
import axios from 'axios';
import { transmit } from '../services/transmit';

export default {
    name: "ChatWidget",
    data() {
        return {
            isOpen: false,
            isLoading: false,
            newMessage: "",
            messages: [],
            sessionId: null,
            subscription: null,
        };
    },

    async beforeDestroy() {
        // Limpia la suscripción cuando el componente se destruye
        if (this.subscription) {
            try {
                await this.subscription.delete();
                console.log('[Transmit] Suscripción eliminada correctamente');
            } catch (error) {
                console.error('[Transmit] Error al eliminar suscripción:', error);
            }
        }
    },

    methods: {
        // Método para formatear precios
        formatPrice(price) {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        },

        // Método para obtener productos por categoría
        getProductsByCategory(category, products) {
            // Por simplicidad, asignamos productos basado en su ID
            // En tu caso real, podrías tener un campo category en el producto
            if (category === 'Portátiles') {
                return products.filter(p => p.id <= 3);
            } else if (category === 'Monitores') {
                return products.filter(p => p.id > 3);
            }
            return products;
        },

        toggleChat() {
            this.isOpen = !this.isOpen;
            // Si abrimos el chat y aún no estamos conectados, iniciamos la conexión.
            if (this.isOpen && !this.sessionId) {
                this.connect();
            }
        },

        async connect() {
            this.isLoading = true;
            try {
                const response = await axios.post('/api/v1/chat/connect');
                if (response.data.success) {
                    this.sessionId = response.data.session_id;

                    console.log("📡 Session ID recibido:", this.sessionId);

                    // Mensaje de bienvenida local
                    this.messages.push({
                        type: 'assistant',
                        message: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
                    });
                    this.scrollToBottom();

                    // Suscribirse al canal usando la API correcta
                    const channelName = `chat_${this.sessionId}`;
                    console.log("📡 Iniciando suscripción al canal:", channelName);
                    await this.subscribeToChannel(channelName);
                }
            } catch (error) {
                console.error("Error al conectar con el servidor de chat:", error);
                this.messages.push({
                    type: 'error',
                    message: 'No se pudo conectar con el asistente. Inténtalo de nuevo.'
                });
            } finally {
                this.isLoading = false;
            }
        },

        async subscribeToChannel(channelName) {
            if (!channelName) {
                console.error("[Transmit] ❌ No se pasó channelName");
                return;
            }

            try {
                console.log(`[Transmit] 🔗 Creando suscripción al canal: ${channelName}`);

                // Crear la suscripción usando la API correcta de Transmit
                const subscription = transmit.subscription(channelName);

                // Configurar el listener para mensajes ANTES de crear la suscripción
                subscription.onMessage((data) => {
                    console.log(`[Transmit] 📩 Mensaje recibido en ${channelName}:`, data);
                    this.handleTransmitMessage(data);
                });

                // Configurar el listener para errores (si está disponible)
                if (subscription.onError) {
                    subscription.onError((error) => {
                        console.error(`[Transmit] ❌ Error en suscripción ${channelName}:`, error);
                        this.messages.push({
                            type: 'error',
                            message: 'Error de conexión en tiempo real'
                        });
                        this.scrollToBottom();
                    });
                }

                // Crear la suscripción en el servidor - ESTO inicia la conexión SSE
                console.log(`[Transmit] 📡 Registrando suscripción en el servidor...`);
                await subscription.create();

                // Guardar referencia de la suscripción
                this.subscription = subscription;

                console.log(`[Transmit] ✅ Suscripción creada exitosamente: ${channelName}`);

                // Mensaje de confirmación
                this.messages.push({
                    type: 'system',
                    message: '🔗 Conectado en tiempo real'
                });
                this.scrollToBottom();

            } catch (error) {
                console.error(`[Transmit] ❌ Error al crear suscripción:`, error);
                this.messages.push({
                    type: 'error',
                    message: 'Conexión en tiempo real no disponible. El chat funciona normalmente.'
                });
                this.scrollToBottom();
            }
        },

        handleTransmitMessage(data) {
            console.log("[Transmit] Procesando mensaje:", data);

            // Si el mensaje tiene estructura de evento
            if (data && typeof data === 'object' && data.event) {
                switch (data.event) {
                    case 'connection_established':
                        console.log('[Transmit] Conexión establecida confirmada');
                        break;

                    case 'ai_message':
                        this.messages.push({
                            type: 'assistant',
                            message: data.message
                        });
                        this.scrollToBottom();
                        break;

                    case 'ai_message_formatted':
                        // NUEVO: Manejo de mensajes formateados con productos
                        this.messages.push({
                            type: 'assistant',
                            format_type: 'formatted_response',
                            data: data.data,
                            recommendations: data.recommendations || []
                        });
                        this.scrollToBottom();
                        break;

                    case 'user_message':
                        console.log('[Transmit] Confirmación de mensaje de usuario');
                        break;

                    case 'error_message':
                        this.messages.push({
                            type: 'error',
                            message: data.message
                        });
                        this.scrollToBottom();
                        break;

                    case 'typing':
                        this.isLoading = data.typing || false;
                        break;

                    default:
                        console.log('[Transmit] Evento desconocido:', data.event);
                }
            }
            // Si el mensaje es directo (solo texto o mensaje simple)
            else if (data && data.message) {
                this.messages.push({
                    type: 'assistant',
                    message: data.message
                });
                this.scrollToBottom();
            }
            // Si es un mensaje plano (string)
            else if (typeof data === 'string') {
                this.messages.push({
                    type: 'assistant',
                    message: data
                });
                this.scrollToBottom();
            }
            else {
                console.log('[Transmit] Formato de mensaje no reconocido:', data);
            }
        },

        async sendMessage() {
            if (!this.newMessage.trim() || this.isLoading) return;

            // Agregar mensaje del usuario localmente
            this.messages.push({
                type: 'user',
                message: this.newMessage,
            });

            const messageToSend = this.newMessage;
            this.newMessage = "";
            this.scrollToBottom();

            try {
                // Enviar mensaje al backend
                await axios.post('/api/v1/chat/send', {
                    session_id: this.sessionId,
                    message: messageToSend,
                });
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
                this.messages.push({
                    type: 'error',
                    message: 'Tu mensaje no se pudo enviar. Por favor, inténtalo de nuevo.',
                });
                this.scrollToBottom();
            }
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
    },
};
</script>