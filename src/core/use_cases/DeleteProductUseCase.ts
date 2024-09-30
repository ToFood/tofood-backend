import { IProductRepository } from '../../adapters/repositories/IProductRepository';

/**
 * Caso de uso para deletar um produto pelo ID.
 * Se ocorrer um erro na exclusão, será tratado aqui.
 */
export class DeleteProductUseCase {
    constructor(private productRepository: IProductRepository) {}

    
    /**
     * Executa a exclusão de um produto existente pelo ID.
     * @param id ID do produto a ser deletado.
     */
    async execute(id: string): Promise<void> {
        try {
            // Chamando o método delete do repositório para remover o produto
            await this.productRepository.delete(id);
        } catch (error: any) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }
}
