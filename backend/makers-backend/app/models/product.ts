import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Brand from './brand.js'
import Category from './category.js'
import ProductAttribute from './product_attribute.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare price: number

  @column()
  declare sku: string

  @column()
  declare stockQuantity: number

  @column()
  declare brandId: number // Clave foránea

  @column()
  declare categoryId: number // Clave foránea

  // Relación: Un producto pertenece a una marca
  @belongsTo(() => Brand)
  declare brand: BelongsTo<typeof Brand>

  // Relación: Un producto pertenece a una categoría
  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  // Relación: Un producto tiene muchos atributos
  @hasMany(() => ProductAttribute)
  declare attributes: HasMany<typeof ProductAttribute>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}