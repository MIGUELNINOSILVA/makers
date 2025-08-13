import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Product from './product.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Brand extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  // Relación: Una marca tiene muchos productos
  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}