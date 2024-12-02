import fs from "fs";
import { ProductDTO } from "../../adapters/dtos/ProductDTO";
import { IProductRepository } from "../../adapters/repositories/IProductRepository";
import ProductModel from "../../external/database/postgreSQL/frameworks/models/ProductModel";

interface CreateProductRequest {
  name: string;
  category: string;
  price: number;
  description: string;
  imagePath: string;
  mimetype: string;
}

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(request: CreateProductRequest): Promise<ProductDTO> {
    const { name, category, price, description, imagePath, mimetype } = request;

    try {
      // Read and encode image to Base64
      if (!fs.existsSync(imagePath)) {
        throw new Error("Image file not found");
      }
      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
      const imageDataUri = `data:${mimetype};base64,${imageBase64}`;

      // Save product to database
      const savedProduct = await ProductModel.create({
        name,
        category,
        price,
        description,
        image: imageDataUri,
      });

      // Delete the temporary image file
      fs.unlinkSync(imagePath);

      // Convert the saved product to DTO
      return this.toDTO(savedProduct);
    } catch (error: any) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  private toDTO(product: any): ProductDTO {
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
