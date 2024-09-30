// File Path: src/tests/ProductTest.ts

// Importando cada caso de uso separadamente
import { CreateProductUseCase } from "../core/use_cases/CreateProductUseCase";
import { UpdateProductUseCase } from "../core/use_cases/UpdateProductUseCase";
import { DeleteProductUseCase } from "../core/use_cases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "../core/use_cases/GetProductByIdUseCase";
import { ListProductsByCategoryUseCase } from "../core/use_cases/ListProductsByCategoryUseCase";
import { IProductRepository } from "../adapters/repositories/IProductRepository";
import { Product } from "../core/entities/Product";
import { beforeEach, describe, it, expect } from "@jest/globals";

// Mock do repositório de produtos para simular o comportamento real sem precisar de infraestrutura externa
class MockProductRepository implements IProductRepository {
    private products: Product[] = [];

    // Simulação da criação de um produto
    async create(product: Product): Promise<Product> {
        product._id = "generated-id"; // Gera um ID para o produto criado
        this.products.push(product); // Adiciona o produto à lista de produtos mockados
        return product; // Retorna o produto criado
    }

    // Simulação da atualização de um produto
    async update(id: string, productData: Partial<Product>): Promise<Product | null> {
        const index = this.products.findIndex((p) => p._id === id); // Procura pelo produto pelo ID
        if (index === -1) return null; // Retorna null se o produto não for encontrado

        // Atualiza apenas os campos fornecidos em productData
        this.products[index] = { ...this.products[index], ...productData };
        return this.products[index]; // Retorna o produto atualizado
    }

    // Simulação da exclusão de um produto pelo ID
    async delete(id: string): Promise<void> {
        this.products = this.products.filter((product) => product._id !== id); // Remove o produto da lista
    }

    // Simulação de busca de um produto pelo ID
    async findById(id: string): Promise<Product | null> {
        return this.products.find((product) => product._id === id) || null; // Retorna o produto ou null se não for encontrado
    }

    // Simulação de busca de produtos por categoria
    async findByCategory(category: string): Promise<Product[]> {
        return this.products.filter((product) => product.category === category); // Retorna todos os produtos da categoria especificada
    }
}

// Bloco de testes dos casos de uso de Produto
describe("Product Use Cases", () => {
    let productRepository: IProductRepository;

    // Casos de uso da aplicação
    let createProductUseCase: CreateProductUseCase;
    let updateProductUseCase: UpdateProductUseCase;
    let deleteProductUseCase: DeleteProductUseCase;
    let getProductByIdUseCase: GetProductByIdUseCase;
    let listProductsByCategoryUseCase: ListProductsByCategoryUseCase;

    // Antes de cada teste, recria o mock do repositório e inicializa os casos de uso
    beforeEach(() => {
        productRepository = new MockProductRepository();
        createProductUseCase = new CreateProductUseCase(productRepository);
        updateProductUseCase = new UpdateProductUseCase(productRepository);
        deleteProductUseCase = new DeleteProductUseCase(productRepository);
        getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
        listProductsByCategoryUseCase = new ListProductsByCategoryUseCase(productRepository);
    });

    // Testes para o caso de uso de criação de produto
    describe("CreateProductUseCase", () => {
        it("deve criar um produto com sucesso", async () => {
            const productRequest = {
                name: "Produto A",
                category: "Categoria X",
                price: 99.99,
                description: "Um ótimo produto",
                imagePath: "/images/produtoA.png",
                mimetype: "image/png",
            };

            // Executa o caso de uso de criação e valida se o produto foi criado corretamente
            const result = await createProductUseCase.execute(productRequest);

            // Verificações para garantir que o produto criado tenha as propriedades esperadas
            expect(result).toHaveProperty("id");
            expect(result.name).toBe(productRequest.name);
            expect(result.category).toBe(productRequest.category);
            expect(result.price).toBe(productRequest.price);
            expect(result.description).toBe(productRequest.description);
        });
    });

    // Testes para o caso de uso de atualização de produto
    describe("UpdateProductUseCase", () => {
        it("deve atualizar um produto existente", async () => {
            const productRequest = {
                name: "Produto A",
                category: "Categoria X",
                price: 99.99,
                description: "Um ótimo produto",
                imagePath: "/images/produtoA.png",
                mimetype: "image/png",
            };

            // Cria o produto antes de atualizar
            const createdProduct = await createProductUseCase.execute(productRequest);

            // Dados do produto atualizado
            const updatedProductRequest = {
                id: createdProduct.id,
                name: "Produto A Atualizado",
                category: createdProduct.category,
                price: 129.99,
                description: createdProduct.description,
                imagePath: createdProduct.image,
                mimetype: "image/png",
            };

            // Executa o caso de uso de atualização, passando apenas o `UpdateProductRequest`
            const updatedProduct = await updateProductUseCase.execute(updatedProductRequest);

            // Verificações para garantir que o produto foi atualizado corretamente
            expect(updatedProduct).not.toBeNull();
            expect(updatedProduct?.name).toBe("Produto A Atualizado");
            expect(updatedProduct?.price).toBe(129.99);
        });

        it("deve retornar null ao tentar atualizar um produto não existente", async () => {
            // Tenta atualizar um produto que não existe
            const updatedProductRequest = {
                id: "inexistente-id",
                name: "Produto Inexistente",
                category: "Categoria Y",
                price: 199.99,
                description: "Produto que não existe",
                imagePath: "/images/inexistente.png",
                mimetype: "image/png",
            };

            const updatedProduct = await updateProductUseCase.execute(updatedProductRequest);

            // Verifica se o retorno é null, indicando que o produto não foi encontrado
            expect(updatedProduct).toBeNull();
        });
    });

    // Testes para o caso de uso de exclusão de produto
    describe("DeleteProductUseCase", () => {
        it("deve deletar um produto existente", async () => {
            const productRequest = {
                name: "Produto A",
                category: "Categoria X",
                price: 99.99,
                description: "Um ótimo produto",
                imagePath: "/images/produtoA.png",
                mimetype: "image/png",
            };

            // Cria o produto antes de deletar
            const createdProduct = await createProductUseCase.execute(productRequest);

            // Deleta o produto
            await deleteProductUseCase.execute(createdProduct.id);

            // Verifica se o produto foi removido corretamente
            const foundProduct = await productRepository.findById(createdProduct.id);
            expect(foundProduct).toBeNull();
        });
    });

    // Testes para o caso de uso de busca de produto por ID
    describe("GetProductByIdUseCase", () => {
        it("deve retornar um produto pelo ID", async () => {
            const productRequest = {
                name: "Produto A",
                category: "Categoria X",
                price: 99.99,
                description: "Um ótimo produto",
                imagePath: "/images/produtoA.png",
                mimetype: "image/png",
            };

            // Cria o produto antes de buscar
            const createdProduct = await createProductUseCase.execute(productRequest);

            // Busca o produto pelo ID
            const foundProduct = await getProductByIdUseCase.execute(createdProduct.id);

            // Verifica se o produto foi encontrado corretamente
            expect(foundProduct).not.toBeNull();
            expect(foundProduct?.name).toBe(productRequest.name);
        });

        it("deve retornar null para um ID inexistente", async () => {
            // Tenta buscar um produto com ID inexistente
            const foundProduct = await getProductByIdUseCase.execute("inexistente-id");
            expect(foundProduct).toBeNull();
        });
    });

    // Testes para o caso de uso de listar produtos por categoria
    describe("ListProductsByCategoryUseCase", () => {
        it("deve retornar uma lista de produtos pela categoria", async () => {
            const productRequest = {
                name: "Produto A",
                category: "Categoria X",
                price: 99.99,
                description: "Um ótimo produto",
                imagePath: "/images/produtoA.png",
                mimetype: "image/png",
            };

            // Cria um produto para a categoria especificada
            await createProductUseCase.execute(productRequest);

            // Busca produtos pela categoria
            const productsByCategory = await listProductsByCategoryUseCase.execute("Categoria X");

            // Verifica se a lista contém produtos e se a categoria está correta
            expect(productsByCategory.length).toBeGreaterThan(0);
            expect(productsByCategory[0].category).toBe("Categoria X");
        });

        it("deve retornar uma lista vazia para uma categoria inexistente", async () => {
            // Tenta buscar produtos por uma categoria que não existe
            const productsByCategory = await listProductsByCategoryUseCase.execute("Categoria Y");
            expect(productsByCategory.length).toBe(0);
        });
    });
});
