// import type { HttpContext } from '@adonisjs/core/http'

import Product from "#models/product"
import { HttpContext } from "@adonisjs/core/http"

export default class ProductsController {

    /**
     * Displays a list of all products.
     * GET /products
     */
    public async index({ response }: HttpContext) {
        const products = await Product.query().preload('brand').preload('category').paginate(1, 10)
        return response.ok(products)
    }

    /**
     * Displays a single product based on its ID.
     * GET /products/:id
     */
    public async show({ params, response }: HttpContext) {
        const product = await Product.query()
            .where('id', params.id)
            .preload('brand')
            .preload('category')
            .preload('attributes')
            .firstOrFail()

        return response.ok(product)
    }

    /**
     * Specific logic for the inventory summary needed by the chatbot.
     * GET /inventory/summary
     */
    public async getInventorySummary({ response }: HttpContext) {
        const totalResult = await Product.query().count('* as total')
        const totalProducts = totalResult[0].$extras.total

        const countsByBrand = await Product.query()
            .select('brand_id')
            .count('* as count')
            .groupBy('brand_id')
            .preload('brand')

        const summary = countsByBrand.reduce((acc, entry) => {
            if (entry.brand) {
                const brandKey = `${entry.brand.name.toLowerCase()}_count`
                acc[brandKey] = entry.$extras.count
            }
            return acc
        }, {} as Record<string, number>)

        const finalResponse = {
            total_products: totalProducts,
            ...summary,
        }

        return response.ok(finalResponse)
    }

    /**
     * Searches for products with advanced filters, including attributes.
     * GET /products/search?q=laptop
     * GET /products/search?brand=dell&category=laptop
     * GET /products/search?attributes=RAM:16GB,Processor:i7
     */
    public async search({ request, response }: HttpContext) {
        // ADJUSTMENT: Added 'attributes' parameter to filter by variants.
        const { brand, model, q, category, attributes } = request.qs()

        let query = Product.query()
            .preload('brand')
            .preload('category')
            .preload('attributes')

        // General search filter (q)
        if (q) {
            const searchTerm = `%${q.toLowerCase().trim()}%`
            query.where((subQuery) => {
                subQuery
                    .whereRaw('LOWER(name) LIKE ?', [searchTerm])
                    .orWhereRaw('LOWER(description) LIKE ?', [searchTerm])
                    .orWhereHas('brand', (brandQuery) => {
                        brandQuery.whereRaw('LOWER(name) LIKE ?', [searchTerm])
                    })
                    .orWhereHas('category', (categoryQuery) => {
                        categoryQuery.whereRaw('LOWER(name) LIKE ?', [searchTerm])
                    })
            })
        }

        // Specific filters (will be applied with AND)
        if (brand) {
            query.whereHas('brand', (brandQuery) => {
                brandQuery.whereRaw('LOWER(name) LIKE ?', [`%${brand.toLowerCase()}%`])
            })
        }

        if (model) {
            query.where((subQuery) => {
                subQuery
                    .whereRaw('LOWER(name) LIKE ?', [`%${model.toLowerCase()}%`])
                    .orWhereRaw('LOWER(description) LIKE ?', [`%${model.toLowerCase()}%`])
            })
        }

        if (category) {
            query.whereHas('category', (categoryQuery) => {
                categoryQuery.whereRaw('LOWER(name) LIKE ?', [`%${category.toLowerCase()}%`])
            })
        }

        // --- NEW: Logic to filter by attributes (variants) ---
        // Expects a format like: attributes=RAM:16GB,Storage:1TB SSD
        if (attributes && typeof attributes === 'string') {
            const attributePairs = attributes.split(',');

            attributePairs.forEach(pair => {
                const [key, value] = pair.split(':');
                if (key && value) {
                    query.whereHas('attributes', (attributeQuery) => {
                        attributeQuery
                            .whereRaw('LOWER(attribute_name) LIKE ?', [`%${key.toLowerCase().trim()}%`])
                            .andWhereRaw('LOWER(attribute_value) LIKE ?', [`%${value.toLowerCase().trim()}%`]);
                    });
                }
            });
        }
        // --- END OF NEW LOGIC ---

        const products = await query.paginate(1, 10)

        const searchParams = { brand, model, q, category, attributes }

        if (products.length === 0) {
            return response.ok({
                message: 'No products were found matching the search criteria.',
                products: [],
                search_params: searchParams
            })
        }

        return response.ok({
            products: products,
            search_params: searchParams
        })
    }


    /**
     * Gets products of a specific brand with all their features.
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
                message: `No products were found for the brand "${params.brandName}".`,
                brand_searched: params.brandName
            })
        }

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
            summary: this.generateProductSummary(product)
        }))

        return response.ok({
            products: formattedProducts,
            total_found: products.length,
            brand_searched: params.brandName
        })
    }

    /**
     * Helper method to generate a product feature summary.
     */
    private generateProductSummary(product: Product): string {
        const attributes = product.attributes || []
        const keyAttributes = {
            processor: attributes.find(attr => /processor|cpu/i.test(attr.attributeName)),
            ram: attributes.find(attr => /ram|memory/i.test(attr.attributeName)),
            storage: attributes.find(attr => /storage|disk|ssd|hdd/i.test(attr.attributeName)),
            screen: attributes.find(attr => /screen|display/i.test(attr.attributeName))
        }

        const summaryParts = []
        if (keyAttributes.processor) summaryParts.push(`Processor: ${keyAttributes.processor.attributeValue}`)
        if (keyAttributes.ram) summaryParts.push(`RAM: ${keyAttributes.ram.attributeValue}`)
        if (keyAttributes.storage) summaryParts.push(`Storage: ${keyAttributes.storage.attributeValue}`)
        if (keyAttributes.screen) summaryParts.push(`Screen: ${keyAttributes.screen.attributeValue}`)

        return summaryParts.length > 0 ? summaryParts.join(', ') : 'Detailed specifications available.'
    }
}