import { IProductRepository } from "../../adapters/repositories/IProductRepository";
import ProductModel from "../../external/database/postgreSQL/frameworks/models/ProductModel.js";

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
      // Chamando o método destroy do modelo para remover o produto
      const rowsDeleted = await ProductModel.destroy({
        where: { id },
      });

      if (rowsDeleted === 0) {
        throw new Error(`Product with ID ${id} not found`);
      }
    } catch (error: any) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}
