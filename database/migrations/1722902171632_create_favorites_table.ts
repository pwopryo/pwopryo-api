import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('property_id')
        .unsigned()
        .references('properties.id')
        .onDelete('CASCADE')
        .notNullable()
      table.unique(['user_id', 'property_id'])
      table.boolean('is_liked').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}