import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // --- Clave Primaria ---
      table.increments('id').primary()

      // --- Campos Principales ---
      table.string('name', 255).notNullable()
      table.text('description').nullable() // La descripción puede ser opcional
      table.decimal('price', 10, 2).notNullable().defaultTo(0.00) // 10 dígitos totales, 2 decimales
      table.string('sku', 100).notNullable().unique() // El SKU debe ser único
      table.integer('stock_quantity').unsigned().notNullable().defaultTo(0) // Unsigned para no permitir negativos

      // --- Claves Foráneas (Relaciones) ---
      // Relación con la tabla 'brands'
      table.integer('brand_id').unsigned().references('id').inTable('brands').onDelete('SET NULL').nullable()
      // Relación con la tabla 'categories'
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL').nullable()


      // --- Timestamps ---
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}