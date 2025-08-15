// services/transmit.js
import { Transmit } from '@adonisjs/transmit-client'

const BASE_URL = 'http://localhost:3333'

export const transmit = new Transmit({
  baseUrl: BASE_URL,
  maxReconnectionAttempts: 5,
  onReconnectAttempt: (attempt) => {
    console.log('[Transmit] Intento de reconexión #' + attempt)
  },
  onReconnectFailed: () => {
    console.log('[Transmit] Falló la reconexión')
  }
})

// Agregar listeners globales para debugging
transmit.on('connected', () => {
  console.log('[Transmit] ✅ Conectado al servidor SSE')
})

transmit.on('disconnected', () => {
  console.log('[Transmit] ❌ Desconectado del servidor SSE')
})

transmit.on('reconnecting', () => {
  console.log('[Transmit] 🔄 Reconectando al servidor SSE...')
})