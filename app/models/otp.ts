import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

type OtpType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'

export default class Otp extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare type: string

  @column()
  declare code: string

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Generates a otp code for a given user.
  static async generateVerifyEmailOtp(user: User) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await Otp.expireOtp(user, 'verifyEmailOtps')
    const record = await user.related('otps').create({
      type: 'VERIFY_EMAIL',
      expiresAt: DateTime.now().plus({ minutes: 10 }),
      code: otp,
    })

    return record.code
  }

  // Generates a password reset otp code for a given user or returns a code if the user is null.
  static async generatePasswordResetOtp(user: User | null) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    if (!user) return otp

    await Otp.expireOtp(user, 'passwordResetOtps')
    const record = await user.related('otps').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ minutes: 10 }),
      code: otp,
    })

    return record.code
  }

  // Expires all tokens of a specified type for a given user.
  static async expireOtp(user: User, relationName: 'passwordResetOtps' | 'verifyEmailOtps') {
    await user.related(relationName).query().update({
      expiresAt: DateTime.now(),
    })
  }

  // Retrieves the user associated with a valid token of a specified type.
  static async getUserOtp(code: string, type: OtpType) {
    const record = await Otp.query()
      .preload('user')
      .where({ code: code, type: type })
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  // Verifies the existence and validity of a token of a specified type.
  static async verify(code: string, type: OtpType) {
    const record = await Otp.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where({ code: code, type: type })
      .first()

    return !!record
  }
}