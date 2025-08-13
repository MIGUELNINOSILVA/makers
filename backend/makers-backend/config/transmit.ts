// En config/transmit.ts
import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  pingInterval: 30000,
  transport: null,

  // Esta es la parte que soluciona el problema
  channels: {
    'chat_*': true, 
  },
})