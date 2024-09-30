import { IProductRepository } from '../../adapters/repositories/IProductRepository';
import { ProductDTO } from '../../adapters/dtos/ProductDTO';
import { Product } from '../entities/Product';

/**
 * Caso de uso para buscar um produto pelo ID.
 * Se o produto não for encontrado ou ocorrer um erro, será tratado aqui.
 */
export class GetProductByIdUseCase {
    constructor(private productRepository: IProductRepository) {}


    /**
     * Busca um produto pelo ID e retorna como DTO.
     */
    async execute(id: string): Promise<ProductDTO | null> {
        try {
            const product = await this.productRepository.findById(id);
            if (!product) {
                return null;
            }
            return this.toDTO(product);
        } catch (error: any) {
            throw new Error(`Error fetching product by ID: ${error.message}`);
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
