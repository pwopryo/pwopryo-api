import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Property from './property.js'
import Favorite from './favorite.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatar: string

  @column()
  declare phoneNumber: string

  @column({ serializeAs: null })
  declare OTP: string

  @column({ serializeAs: null })
  declare role: 'User' | 'Admin'

  @column()
  declare isVerified: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Property)
  declare properties: HasMany<typeof Property>

  @hasMany(() => Favorite)
  declare favorites: HasMany<typeof Favorite>

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)
}