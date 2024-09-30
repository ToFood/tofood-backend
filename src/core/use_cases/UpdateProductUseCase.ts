import { IProductRepository } from '../../adapters/repositories/IProductRepository';
import { Product } from '../entities/Product';
import { ProductDTO } from '../../adapters/dtos/ProductDTO';
import fs from 'fs';

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
    constructor(private productRepository: IProductRepository) {}


    /**
     * Atualiza um produto existente.
     * Converte a imagem para Base64, se houver, e retorna o produto atualizado como DTO.
     * Caso ocorra um erro durante a atualização ou leitura de imagem, será tratado aqui.
     */
    async execute(request: UpdateProductRequest): Promise<ProductDTO | null> {
        
        const { id, name, category, price, description, imagePath, mimetype } = request;

        const updateData: Partial<Product> = { name, category, price, description };

        try {
            // Se houver uma imagem nova, ler o arquivo e converter para Base64
            if (imagePath) {
                const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
                const imageDataUri = `data:${mimetype};base64,${imageBase64}`;
                updateData.image = imageDataUri;
                fs.unlinkSync(imagePath);
            }

            // Atualizar o produto no repositório
            const updatedProduct = await this.productRepository.update(id, updateData);

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
