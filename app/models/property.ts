import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import PropertyImage from './property_image.js'
import Favorite from './favorite.js'
import Offer from './offer.js'

export default class Property extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare department: string

  @column()
  declare type: string

  @column()
  declare price: number

  @column()
  declare numLivingRooms: number

  @column()
  declare numBedrooms: number

  @column()
  declare numBathrooms: number

  @column({ serializeAs: null })
  declare isAvailable: boolean

  @column()
  declare disponibility: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => PropertyImage)
  declare images: HasMany<typeof PropertyImage>

  @manyToMany(() => Offer, {
    pivotTable: 'property_offers'
  })
  declare offers: ManyToMany<typeof Offer>

  @hasMany(() => Favorite)
  declare favorites: HasMany<typeof Favorite>
}