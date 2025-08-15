import axios from 'axios'
import { transmit } from '../services/transmit'

export default {
  name: 'Chat',
  data() {
    return {
      sessionId: null,
      messages: [],
      isTyping: false,
      isConnected: false,
      newMessage: '',
      subscription: null
    }
  },
  methods: {
    async connect() {
      try {
        const response = await axios.post('/api/v1/chat/connect')
        if (response.data.success) {
          this.sessionId = response.data.session_id
          console.log('Conectado con session_id:', this.sessionId)
          this.subscribeToChannel()
        }
      } catch (error) {
        console.error('Error al conectar:', error)
      }
    },
    async subscribeToChannel() {
      if (!this.sessionId) return
      this.subscription = transmit.subscription(`chat_${this.sessionId}`)
      await this.subscription.create()
      this.subscription.onMessage((data) => {
        console.log('Mensaje recibido:', data)
        switch (data.event) {
          case 'connection_established':
          case 'ai_message':
          case 'user_message':
            this.messages.push(data)
            break
          case 'typing':
            this.isTyping = data.typing
            break
          case 'error_message':
            this.messages.push(data)
            break
        }
      })
      this.isConnected = true
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.sessionId) return
      const messageToSend = this.newMessage
      this.newMessage = '' // Limpia el input inmediatamente
      try {
        await axios.post('/api/v1/chat/send', {
          session_id: this.sessionId,
          message: messageToSend,
          // user_id: 'tu_id_de_usuario' // Si tienes autenticación
        })
      } catch (error) {
        console.error('Error al enviar el mensaje:', error)
        this.messages.push({
          event: 'error_message',
          message: 'No se pudo enviar tu mensaje. Inténtalo de nuevo.',
          type: 'error',
        })
      }
    },
    disconnect() {
      if (this.subscription) {
        this.subscription.delete()
        console.log('Desconectado y suscripción eliminada.')
      }
    }
  },
  beforeDestroy() {
    this.disconnect()
  }
}