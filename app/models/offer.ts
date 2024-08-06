import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Property from './property.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Offer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Property, {
    pivotTable: 'offer_properties'
  })
  declare properties: ManyToMany<typeof Property>
}