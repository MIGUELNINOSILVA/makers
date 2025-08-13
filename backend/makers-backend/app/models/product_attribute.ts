import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Product from './product.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ProductAttribute extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number // Clave foránea

  @column()
  declare attributeName: string

  @column()
  declare attributeValue: string

  // Relación: Este atributo pertenece a un producto
  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}