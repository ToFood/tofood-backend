import { ProductDTO } from "../../adapters/dtos/ProductDTO";
import { IProductRepository } from "../../adapters/repositories/IProductRepository";
import ProductModel from "../../external/database/postgreSQL/frameworks/models/ProductModel";

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
      // Fetch the product by ID from PostgreSQL
      const product = await ProductModel.findOne({ where: { id } });

      // If no product is found, return null
      if (!product) {
        return null;
      }

      // Convert the product to a DTO and return it
      return this.toDTO(product);
    } catch (error: any) {
      throw new Error(`Error fetching product by ID: ${error.message}`);
    }
  }

  /**
   * Converte uma entidade Product em ProductDTO.
   */
  private toDTO(product: typeof ProductModel): ProductDTO {
    return {
      id: product.id, // Make sure this matches the column name in your model
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
    };
  }
}
