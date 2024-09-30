import { IProductRepository } from '../../adapters/repositories/IProductRepository';
import { ProductDTO } from '../../adapters/dtos/ProductDTO';
import { Product } from '../entities/Product';

/**
 * Caso de uso para listar produtos por categoria.
 * Se ocorrer um erro durante a listagem, será tratado aqui.
 */
export class ListProductsByCategoryUseCase {
    constructor(private productRepository: IProductRepository) {}

    
    /**
     * Lista todos os produtos de uma categoria específica como DTO.
     */
    async execute(category: string): Promise<ProductDTO[]> {
        try {
            const products = await this.productRepository.findByCategory(category);
            return products.map(product => this.toDTO(product));
        } catch (error: any) {
            throw new Error(`Error listing products by category: ${error.message}`);
        }
    }

    /**
     * Converte uma entidade Product em ProductDTO.
     */
    private toDTO(product: Product): ProductDTO {
        return {
            id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            image: product.image,
        };
    }
}
