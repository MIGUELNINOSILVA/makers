/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import ChatsController from '#controllers/chats_controller'
import ProductsController from '#controllers/products_controller'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'


router.group(() => {
  router.resource('/products', ProductsController)
  router.get('/inventory/summary', [ProductsController, 'getInventorySummary'])
  router.get('/products/search', [ProductsController, 'search'])
  router.get('/products/by-brand/:brandName', [ProductsController, 'getByBrand'])
  // router.post('/client/convertation', [ProductsController, 'getDataConvertation'])

  router.post('/chat/connect', [ChatsController, 'connect'])
  router.post('/chat/send', [ChatsController, 'sendMessage'])
  router.post('/chat/receive', [ChatsController, 'receiveFromN8N']) // Para N8N
  router.post('/chat/disconnect', [ChatsController, 'disconnect'])


  router.get('/chat/stream', ({ request, response }) => {
    return transmit.registerRoutes(request, response)
  })
}).prefix('/api/v1')
