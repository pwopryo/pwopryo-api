import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'property_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('property_id')
        .unsigned()
        .references('properties.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()
      table.string('image_name').notNullable()
      table.boolean('is_primary').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}