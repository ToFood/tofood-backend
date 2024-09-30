import { IProductRepository } from '../../../../adapters/repositories/IProductRepository';
import { Product } from '../../../../core/entities/Product';
import ProductModel from '../frameworks/mongoose/models/ProductModel';

export class MongoProductRepository implements IProductRepository {
    
    // Método para criar um novo produto
    async create(product: Product): Promise<Product> {
        const productModel = new ProductModel({
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            image: product.image
        });

        // Salvar o produto no banco de dados
        const savedProduct = await productModel.save();

        // Retornar a entidade Product com os dados salvos
        return new Product(
            savedProduct.id.toString(),
            savedProduct.name,
            savedProduct.category,
            savedProduct.price,
            savedProduct.description,
            savedProduct.image
        );
    }

    // Método para atualizar um produto existente e retornar o produto atualizado
    async update(id: string, productData: Partial<Product>): Promise<Product | null> {
        const updatedProductData = await ProductModel.findByIdAndUpdate(id, productData, { new: true }).exec();
        
        // Se o produto não for encontrado, retornar null
        if (!updatedProductData) {
            return null;
        }

        // Retornar a entidade Product com os dados atualizados
        return new Product(
            updatedProductData.id.toString(),
            updatedProductData.name,
            updatedProductData.category,
            updatedProductData.price,
            updatedProductData.description,
            updatedProductData.image
        );
    }

    // Método para deletar um produto
    async delete(id: string): Promise<void> {
        await ProductModel.findByIdAndDelete(id);
    }

    // Método para buscar um produto por ID
    async findById(id: string): Promise<Product | null> {
        const productData = await ProductModel.findById(id).exec();
        if (!productData) return null;

        // Retornar a entidade Product com os dados encontrados
        return new Product(
            productData.id.toString(),
            productData.name,
            productData.category,
            productData.price,
            productData.description,
            productData.image
        );
    }

    // Método para buscar produtos por categoria
    async findByCategory(category: string): Promise<Product[]> {
        const productsData = await ProductModel.find({ category }).exec();

        // Mapear os dados encontrados para a entidade Product
        return productsData.map(productData => new Product(
            productData.id.toString(),
            productData.name,
            productData.category,
            productData.price,
            productData.description,
            productData.image
        ));
    }
}
