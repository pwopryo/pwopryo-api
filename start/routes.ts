/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ImagesController = () => import('#controllers/images_controller')
const PropertiesController = () => import('#controllers/properties_controller')
const FavoritesController = () => import('#controllers/favorites_controller')
const MessagesController = () => import('#controllers/messages_controller')

router.get('health', ({ response }) => response.noContent())


// Authentication routes
router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.post('/verify-email', [AuthController, 'verifyEmail'])
  router.post('/logout', [AuthController, 'logout'])
    .use([middleware.auth(), middleware.userVerification()])
  // router.post('/forgot-password', [AuthController, 'forgotPassword'])
  // router.post('/reset-password/:token', [AuthController, 'resetPassword'])
  // router.get('/me', [AuthController, 'getuserInfo']).use(middleware.auth())
}).prefix('auth')


// Users routes
router
  .resource('users', UsersController)
  .use(
    ['index', 'show', 'update', 'destroy'],
    [middleware.auth(), middleware.userVerification()]
  )


// Properties routes
router.group(() => {
  router.get('/properties/filter', [PropertiesController, 'filter'])
  router
    .resource('properties', PropertiesController)
    .use(
      ['store', 'update', 'destroy'],
      [middleware.auth(), middleware.userVerification()]
    )
})


// Favorite routes
router.group(() => {
  router.get('/', [FavoritesController, 'index'])
  router.post('/:id', [FavoritesController, 'store'])
  router.delete('/:id', [FavoritesController, 'update'])
}).use([middleware.auth(), middleware.userVerification()]).prefix('favorites')


// Messages routes
router.post('send-message/:id', [MessagesController, 'sendMessage'])
  .use([middleware.auth(), middleware.userVerification()])


// Images route
router.group(() => {
  router.get('/:type/*', [ImagesController, 'show'])
}).prefix('uploads')

