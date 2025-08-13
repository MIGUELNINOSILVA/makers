// import type { HttpContext } from '@adonisjs/core/http'

import Product from "#models/product"
import { HttpContext } from "@adonisjs/core/http"

export default class ProductsController {

    /**
   * Muestra una lista de todos los productos.
   * GET /products
   */
    public async index({ response }: HttpContext) {
        // Usamos .preload() para traer también la marca y categoría de cada producto
        const products = await Product.query().preload('brand').preload('category').paginate(1, 10)

        return response.ok(products)
    }

    /**
     * Muestra un único producto basado en su ID.
     * GET /products/:id
     */
    public async show({ params, response }: HttpContext) {
        // .findOrFail() falla automáticamente con un error 404 si no encuentra el producto
        const product = await Product.query()
            .where('id', params.id)
            .preload('brand')
            .preload('category')
            .preload('attributes')
            .firstOrFail()

        return response.ok(product)
    }

    /**
   * Lógica específica para el resumen que necesita el chatbot.
   * GET /inventory/summary
   */
    public async getInventorySummary({ response }: HttpContext) {
        // 1. Obtener el conteo total de productos en una sola consulta.
        const totalResult = await Product.query().count('* as total')
        const totalProducts = totalResult[0].$extras.total

        // 2. Obtener el conteo de productos por cada marca en una sola consulta.
        // Esto es equivalente a un "GROUP BY" en SQL.
        const countsByBrand = await Product.query()
            .select('brand_id')
            .count('* as count')
            .groupBy('brand_id')
            .preload('brand')

        // 3. Construir el objeto de respuesta dinámicamente.
        const summary = countsByBrand.reduce((acc, entry) => {
            // Si la marca existe y tiene un nombre, se crea la clave dinámicamente.
            if (entry.brand) {
                const brandKey = `${entry.brand.name.toLowerCase()}_count`
                acc[brandKey] = entry.$extras.count
            }
            return acc
        }, {} as Record<string, number>) // El objeto inicial está vacío

        // 4. Unir el total con los conteos por marca.
        const finalResponse = {
            total_products: totalProducts,
            ...summary,
        }

        return response.ok(finalResponse)
    }

    /**
     * Busca productos por nombre de marca o modelo específico.
     * GET /products/search?brand=dell&model=inspiron (opcional)
     * GET /products/search?q=dell (búsqueda general)
     */
    public async search({ request, response }: HttpContext) {
        const { brand, model, q, category } = request.qs()

        let query = Product.query()
            .preload('brand')
            .preload('category')
            .preload('attributes')

        // Si hay una búsqueda general (q), buscar en múltiples campos
        if (q) {
            const searchTerm = q.toLowerCase().trim()

            query = query.where((subQuery) => {
                subQuery
                    .whereRaw('LOWER(name) LIKE ?', [`%${searchTerm}%`])
                    .orWhereRaw('LOWER(description) LIKE ?', [`%${searchTerm}%`])
                    .orWhereHas('brand', (brandQuery) => {
                        brandQuery.whereRaw('LOWER(name) LIKE ?', [`%${searchTerm}%`])
                    })
                    .orWhereHas('category', (categoryQuery) => {
                        categoryQuery.whereRaw('LOWER(name) LIKE ?', [`%${searchTerm}%`])
                    })
            })
        }

        // Filtro específico por marca
        if (brand) {
            query = query.whereHas('brand', (brandQuery) => {
                brandQuery.whereRaw('LOWER(name) LIKE ?', [`%${brand.toLowerCase()}%`])
            })
        }

        // Filtro específico por modelo (buscar en name o description)
        if (model) {
            query = query.where((subQuery) => {
                subQuery
                    .whereRaw('LOWER(name) LIKE ?', [`%${model.toLowerCase()}%`])
                    .orWhereRaw('LOWER(description) LIKE ?', [`%${model.toLowerCase()}%`])
            })
        }

        // Filtro específico por categoría
        if (category) {
            query = query.whereHas('category', (categoryQuery) => {
                categoryQuery.whereRaw('LOWER(name) LIKE ?', [`%${category.toLowerCase()}%`])
            })
        }

        const products = await query.paginate(1, 10)

        // Si no se encontraron productos, devolver mensaje útil
        if (products.length === 0) {
            return response.ok({
                products: [],
                message: 'No se encontraron productos que coincidan con los criterios de búsqueda.',
                search_params: { brand, model, q, category }
            })
        }

        return response.ok({
            products: products,
            search_params: { brand, model, q, category }
        })
    }

    /**
     * Obtiene productos de una marca específica con todas sus características.
     * Útil para consultas del chatbot como "¿Qué características tienen los Dell?"
     * GET /products/by-brand/:brandName
     */
    public async getByBrand({ params, response }: HttpContext) {
        const brandName = params.brandName.toLowerCase()

        const products = await Product.query()
            .whereHas('brand', (brandQuery) => {
                brandQuery.whereRaw('LOWER(name) LIKE ?', [`%${brandName}%`])
            })
            .preload('brand')
            .preload('category')
            .preload('attributes')
            .limit(10)

        if (products.length === 0) {
            return response.ok({
                products: [],
                message: `No se encontraron productos de la marca "${params.brandName}".`,
                brand_searched: params.brandName
            })
        }

        // Organizar la respuesta de manera más amigable para el chatbot
        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            sku: product.sku,
            stock: product.stockQuantity,
            brand: product.brand?.name,
            category: product.category?.name,
            characteristics: product.attributes?.map(attr => ({
                name: attr.attributeName,
                value: attr.attributeValue
            })) || [],
            // Crear un resumen textual de características principales
            summary: this.generateProductSummary(product)
        }))

        return response.ok({
            products: formattedProducts,
            total_found: products.length,
            brand_searched: params.brandName
        })
    }

    /**
     * Método auxiliar para generar un resumen de características del producto
     * que sea fácil de leer para el chatbot
     */
    private generateProductSummary(product: Product): string {
        const attributes = product.attributes || []

        // Buscar atributos clave comunes en computadores
        const keyAttributes = {
            procesador: attributes.find(attr =>
                attr.attributeName.toLowerCase().includes('procesador') ||
                attr.attributeName.toLowerCase().includes('cpu') ||
                attr.attributeName.toLowerCase().includes('processor')
            ),
            ram: attributes.find(attr =>
                attr.attributeName.toLowerCase().includes('ram') ||
                attr.attributeName.toLowerCase().includes('memoria')
            ),
            almacenamiento: attributes.find(attr =>
                attr.attributeName.toLowerCase().includes('almacenamiento') ||
                attr.attributeName.toLowerCase().includes('disco') ||
                attr.attributeName.toLowerCase().includes('ssd') ||
                attr.attributeName.toLowerCase().includes('hdd')
            ),
            pantalla: attributes.find(attr =>
                attr.attributeName.toLowerCase().includes('pantalla') ||
                attr.attributeName.toLowerCase().includes('screen') ||
                attr.attributeName.toLowerCase().includes('display')
            )
        }

        const summaryParts = []

        if (keyAttributes.procesador) {
            summaryParts.push(`Procesador: ${keyAttributes.procesador.attributeValue}`)
        }
        if (keyAttributes.ram) {
            summaryParts.push(`RAM: ${keyAttributes.ram.attributeValue}`)
        }
        if (keyAttributes.almacenamiento) {
            summaryParts.push(`Almacenamiento: ${keyAttributes.almacenamiento.attributeValue}`)
        }
        if (keyAttributes.pantalla) {
            summaryParts.push(`Pantalla: ${keyAttributes.pantalla.attributeValue}`)
        }

        return summaryParts.length > 0 ? summaryParts.join(', ') : 'Características disponibles en detalle.'
    }

    // public getDataConvertation({request}): HttpContext {
    //     const data = request.output;
    //     re

    // }
}