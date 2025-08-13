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
                <div v-for="message in messages" :key="message.id" class="flex"
                    :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
                    <div class="max-w-[80%] px-4 py-2 rounded-2xl" :class="{
                        'bg-indigo-600 text-white rounded-br-lg': message.sender === 'user',
                        'bg-gray-200 text-gray-800 rounded-bl-lg': message.sender === 'ai'
                    }">
                        <p class="text-sm">{{ message.text }}</p>
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
export default {
    name: "ChatWidget",
    data() {
        return {
            isOpen: false,
            isLoading: false,
            newMessage: "",
            messages: [
                { id: 1, text: "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?", sender: "ai" }
            ],
        };
    },
    methods: {
        toggleChat() {
            this.isOpen = !this.isOpen;
        },
        async sendMessage() {
            if (!this.newMessage.trim() || this.isLoading) return;

            const userMessage = {
                id: Date.now(),
                text: this.newMessage,
                sender: "user",
            };
            this.messages.push(userMessage);
            this.isLoading = true;
            const messageToSend = this.newMessage;
            this.newMessage = "";
            this.scrollToBottom();

            try {
                const aiResponse = await this.callGeminiAPI(messageToSend);
                this.messages.push({
                    id: Date.now() + 1,
                    text: aiResponse,
                    sender: "ai",
                });
            } catch (error) {
                this.messages.push({
                    id: Date.now() + 1,
                    text: "Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.",
                    sender: "ai",
                });
            } finally {
                this.isLoading = false;
                this.scrollToBottom();
            }
        },
        async callGeminiAPI(prompt) {
            const apiKey = ""; // Canvas will provide this
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            // Construimos un historial simple para dar contexto
            const history = this.messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            // El último mensaje del usuario no está en el historial todavía, lo añadimos
            history.push({ role: 'user', parts: [{ text: prompt }] });

            const payload = { contents: history };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Error en la llamada a la API de Gemini");
            }

            const result = await response.json();

            if (result.candidates && result.candidates[0]) {
                return result.candidates[0].content.parts[0].text;
            }

            return "No pude procesar esa respuesta.";
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

<style scoped>
/* Las animaciones y estilos ya están manejados con clases de Tailwind */
</style>
