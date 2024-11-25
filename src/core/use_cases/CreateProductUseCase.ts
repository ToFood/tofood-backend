import fs from "fs";
import { ProductDTO } from "../../adapters/dtos/ProductDTO";
import { IProductRepository } from "../../adapters/repositories/IProductRepository";
import { Product } from "../entities/Product";

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

    // Validate required fields
    if (
      !name ||
      !category ||
      !price ||
      !description ||
      !imagePath ||
      !mimetype
    ) {
      throw new Error("Missing required fields");
    }

    try {
      // Check if the image exists and read it
      if (!fs.existsSync(imagePath)) {
        throw new Error("Image file does not exist");
      }

      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
      const imageDataUri = `data:${mimetype};base64,${imageBase64}`;

      // Create new Product entity
      const product = new Product(
        "generated-id",
        name,
        category,
        price,
        description,
        imageDataUri
      );

      // Save the product in the repository
      const savedProduct = await this.productRepository.create(product);

      // Clean up by removing the temporary image file
      fs.unlinkSync(imagePath);

      // Return the ProductDTO
      return this.toDTO(savedProduct);
    } catch (error: any) {
      // If the error is related to file reading, we want to throw a specific error
      if (
        error.code === "ENOENT" ||
        error.message.includes("Image file does not exist")
      ) {
        throw new Error(`Error creating product: Image file does not exist`);
      }

      if (error.message.includes("File read error")) {
        throw new Error(`Error creating product: File read error`);
      }

      // Catch any other unexpected errors
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

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
