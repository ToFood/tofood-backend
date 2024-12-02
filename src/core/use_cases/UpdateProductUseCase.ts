import fs from "fs";
import { ProductDTO } from "../../adapters/dtos/ProductDTO";
import ProductModel from "../../external/database/postgreSQL/frameworks/models/ProductModel.js";
import { Product as ProductType } from "../entities/Product";

interface UpdateProductRequest {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  imagePath?: string;
  mimetype?: string;
}

export class UpdateProductUseCase {
  /**
   * Atualiza um produto existente.
   * Converte a imagem para Base64, se houver, e retorna o produto atualizado como DTO.
   * Caso ocorra um erro durante a atualização ou leitura de imagem, será tratado aqui.
   */
  async execute(request: UpdateProductRequest): Promise<ProductDTO | null> {
    const { id, name, category, price, description, imagePath, mimetype } =
      request;

    const updateData: Partial<ProductType> = {
      name,
      category,
      price,
      description,
    };

    try {
      // Se houver uma imagem nova, ler o arquivo e converter para Base64
      if (imagePath) {
        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
        const imageDataUri = `data:${mimetype};base64,${imageBase64}`;
        updateData.image = imageDataUri;
        fs.unlinkSync(imagePath);
      }

      // Atualizar o produto no banco de dados
      const [updatedCount] = await ProductModel.update(updateData, {
        where: { id },
      });

      // Se nenhum produto foi atualizado, retornar null
      if (updatedCount === 0) {
        return null;
      }

      // Buscar o produto atualizado
      const updatedProduct = await ProductModel.findOne({ where: { id } });

      if (!updatedProduct) {
        return null;
      }

      // Retornar o DTO do produto atualizado
      return this.toDTO(updatedProduct);
    } catch (error: any) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  /**
   * Converte uma entidade Product em ProductDTO.
   */
  private toDTO(product: ProductType): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
    };
  }
}
