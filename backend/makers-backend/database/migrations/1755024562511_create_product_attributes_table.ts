import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_attributes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // --- Relación con Productos ---
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')

      // --- Campos del Atributo ---
      table.string('attribute_name', 100).notNullable() // Ej: "Memoria RAM"
      table.string('attribute_value', 255).notNullable() // Ej: "16GB DDR5"

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}