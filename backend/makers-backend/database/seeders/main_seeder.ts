import Brand from '#models/brand'
import Category from '#models/category'
import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // 1. Create Brands
    const brands = await Brand.createMany([
      { name: 'Dell', slug: 'dell' },
      { name: 'HP', slug: 'hp' },
      { name: 'Apple', slug: 'apple' },
      { name: 'Lenovo', slug: 'lenovo' },
    ])

    // 2. Create Categories
    const categories = await Category.createMany([
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Monitors', slug: 'monitors' },
      { name: 'Accessories', slug: 'accessories' },
    ])

    // 3. Create Products, associating them with the created brands and categories
    // We use the IDs of the records we just created
    const dellBrandId = brands.find(b => b.name === 'Dell')!.id
    const hpBrandId = brands.find(b => b.name === 'HP')!.id
    const appleBrandId = brands.find(b => b.name === 'Apple')!.id

    const laptopCategoryId = categories.find(c => c.name === 'Laptops')!.id
    const monitorCategoryId = categories.find(c => c.name === 'Monitors')!.id

    await Product.createMany([
      {
        name: 'Dell XPS 15',
        description: 'Powerful laptop for content creators.',
        price: 2199.99,
        sku: 'DELL-XPS15-9530',
        stockQuantity: 15,
        brandId: dellBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'HP Spectre x360',
        description: '2-in-1 convertible design with a touchscreen.',
        price: 1549.50,
        sku: 'HP-SPX360-14',
        stockQuantity: 22,
        brandId: hpBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'Apple MacBook Air M2',
        description: 'Ultralight and with a long-lasting battery.',
        price: 1299.00,
        sku: 'APP-MBA-M2-SLV',
        stockQuantity: 30,
        brandId: appleBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'Dell UltraSharp 27 Monitor',
        description: '4K monitor with accurate colors for professionals.',
        price: 599.99,
        sku: 'DELL-U2723QE',
        stockQuantity: 40,
        brandId: dellBrandId,
        categoryId: monitorCategoryId,
      },
    ])
  }
}