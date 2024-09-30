import { Product } from '../../core/entities/Product';

export interface IProductRepository {
    create(product: Product): Promise<Product>;
    update(id: string, productData: Partial<Product>): Promise<Product | null>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findByCategory(category: string): Promise<Product[]>;
}
