import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Property from './property.js'
import Favorite from './favorite.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import Otp from './otp.js'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

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

  // OTP relation
  @hasMany(() => Otp)
  declare otps: HasMany<typeof Otp>

  @hasMany(() => Otp, {
    onQuery: (query) => query.where('type', 'PASSWORD_RESET'),
  })
  declare passwordResetOtps: HasMany<typeof Otp>

  @hasMany(() => Otp, {
    onQuery: (query) => query.where('type', 'VERIFY_EMAIL'),
  })
  declare verifyEmailOtps: HasMany<typeof Otp>

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  async sendVerifyEmail() {
    const otp = await Otp.generateVerifyEmailOtp(this)

    await mail.sendLater((message) => {
      message
        .to(this.email)
        .from(env.get('EMAIL'))
        .subject('Vérifiez votre nouveau compte Proprio')
        .htmlView('emails/verify_email', { otp: otp })
    })
  }

  async sendWelcomeEmail() {
    await mail.sendLater((message) => {
      message
        .to(this.email)
        .from(env.get('EMAIL'))
        .subject('Bienvenue chez Pwopryo')
        .htmlView('emails/welcome', { user: this })
    })
  }

  async sendForgotPasswordEmail() {
    const otp = await Otp.generatePasswordResetOtp(this)

    await mail.sendLater((message) => {
      message
        .to(this.email)
        .from(env.get('EMAIL'))
        .subject('Réinitialise votre mot de passe Pwopryo')
        .htmlView('emails/forgot_password', { user: this, otp: otp })
    })
  }

  async sendPasswordChangesEmail() {
    await mail.sendLater((message) => {
      message
        .to(this.email)
        .from(env.get('EMAIL'))
        .subject('Pwopryo - Mot de Passe Modifié')
        .htmlView('emails/password_changed', { user: this })
    })
  }
}