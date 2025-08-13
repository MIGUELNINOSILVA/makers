import Brand from '#models/brand'
import Category from '#models/category'
import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // 1. Crear Marcas
    const brands = await Brand.createMany([
      { name: 'Dell', slug: 'dell' },
      { name: 'HP', slug: 'hp' },
      { name: 'Apple', slug: 'apple' },
      { name: 'Lenovo', slug: 'lenovo' },
    ])

    // 2. Crear Categorías
    const categories = await Category.createMany([
      { name: 'Portátiles', slug: 'portatiles' },
      { name: 'Monitores', slug: 'monitores' },
      { name: 'Accesorios', slug: 'accesorios' },
    ])

    // 3. Crear Productos, asociándolos a las marcas y categorías creadas
    // Usamos los IDs de los registros que acabamos de crear
    const dellBrandId = brands.find(b => b.name === 'Dell')!.id
    const hpBrandId = brands.find(b => b.name === 'HP')!.id
    const appleBrandId = brands.find(b => b.name === 'Apple')!.id

    const laptopCategoryId = categories.find(c => c.name === 'Portátiles')!.id
    const monitorCategoryId = categories.find(c => c.name === 'Monitores')!.id

    await Product.createMany([
      {
        name: 'Dell XPS 15',
        description: 'Potente portátil para creadores de contenido.',
        price: 2199.99,
        sku: 'DELL-XPS15-9530',
        stockQuantity: 15,
        brandId: dellBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'HP Spectre x360',
        description: 'Diseño convertible 2-en-1 con pantalla táctil.',
        price: 1549.50,
        sku: 'HP-SPX360-14',
        stockQuantity: 22,
        brandId: hpBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'Apple MacBook Air M2',
        description: 'Ultraligero y con una batería de larga duración.',
        price: 1299.00,
        sku: 'APP-MBA-M2-SLV',
        stockQuantity: 30,
        brandId: appleBrandId,
        categoryId: laptopCategoryId,
      },
      {
        name: 'Monitor Dell UltraSharp 27',
        description: 'Monitor 4K con colores precisos para profesionales.',
        price: 599.99,
        sku: 'DELL-U2723QE',
        stockQuantity: 40,
        brandId: dellBrandId,
        categoryId: monitorCategoryId,
      },
    ])
  }
}