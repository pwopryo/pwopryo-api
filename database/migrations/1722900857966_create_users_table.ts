import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()
      table.string('uuid').notNullable()
      table.string('full_name').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('avatar').nullable()
      table.string('phone_number').notNullable().unique()
      table.enu('role', ['User', 'Admin'], {
        useNative: true,
        enumName: 'user_role',
        existingType: false,
      }).notNullable()
      table.boolean('is_verified').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}