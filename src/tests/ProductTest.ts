import express from "express";
import request from "supertest";
import router from "../adapters/controllers/ProductController";
import {
  createProductUseCase,
  deleteProductUseCase,
  getProductByIdUseCase,
  listProductsByCategoryUseCase,
  updateProductUseCase,
} from "../config/di/container";

jest.mock("../config/di/container", () => ({
  createProductUseCase: { execute: jest.fn() },
  updateProductUseCase: { execute: jest.fn() },
  deleteProductUseCase: { execute: jest.fn() },
  getProductByIdUseCase: { execute: jest.fn() },
  listProductsByCategoryUseCase: { execute: jest.fn() },
}));

const mockProductRepository = {
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByCategory: jest.fn(),
};

jest.mock("../adapters/repositories/IProductRepository");
jest.mock("fs", () => ({
  ...jest.requireActual("fs"), // Keeps other fs methods intact
  existsSync: jest.fn(() => true), // Mock existsSync to return true
  readFileSync: jest.fn(() => "mocked-data"), // Mock readFileSync to return some dummy data
  unlinkSync: jest.fn(), // Mock unlinkSync to avoid deleting any files
}));

jest.mock("mkdirp", () => ({
  sync: jest.fn(), // Mock mkdirp.sync to prevent directory creation
}));

const fs = require("fs");
const app = express();
app.use(express.json());
app.use(router);

describe("ProductController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /products/:productId - getProductById", () => {
    it("should return a product by ID", async () => {
      const mockProduct = {
        id: "prod123",
        name: "Product A",
        category: "Category 1",
        price: "100",
        description: "Description of Product A",
        imagePath: "/path/to/image.jpg",
        mimetype: "image/jpeg",
      };

      (getProductByIdUseCase.execute as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const response = await request(app).get("/products/prod123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(getProductByIdUseCase.execute).toHaveBeenCalledWith("prod123");
    });

    it("should return 404 if the product is not found", async () => {
      (getProductByIdUseCase.execute as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/products/prod123");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });
  });

  describe("GET /products/category/:category - listProductsByCategory", () => {
    it("should return a list of products by category", async () => {
      const mockProducts = [
        { id: "prod1", name: "Product 1", category: "Category 1" },
        { id: "prod2", name: "Product 2", category: "Category 1" },
      ];

      (listProductsByCategoryUseCase.execute as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const response = await request(app).get(
        "/products/category/Category%201"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(listProductsByCategoryUseCase.execute).toHaveBeenCalledWith(
        "Category 1"
      );
    });
  });

  describe("POST /products - createProduct", () => {
    it("should create a new product", async () => {
      const mockProduct = {
        id: "prod123",
        name: "Product A",
        category: "Category 1",
        price: "100",
        description: "Description of Product A",
        imagePath: "/path/to/image.jpg",
        mimetype: "image/jpeg",
      };

      (createProductUseCase.execute as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const response = await request(app)
        .post("/products")
        .field("name", "Product A")
        .field("category", "Category 1")
        .field("price", "100")
        .field("description", "Description of Product A")
        .attach("image", Buffer.from("dummy file"), {
          filename: "image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
      expect(createProductUseCase.execute).toHaveBeenCalledWith({
        name: "Product A",
        category: "Category 1",
        price: "100",
        description: "Description of Product A",
        imagePath: expect.any(String),
        mimetype: "image/jpeg",
      });
    });
  });

  describe("PUT /products/:id - updateProduct", () => {
    it("should update a product", async () => {
      const mockUpdatedProduct = {
        id: "prod123",
        name: "Updated Product A",
        category: "Updated Category",
        price: "150",
        description: "Updated description",
        imagePath: "/path/to/updated-image.jpg",
        mimetype: "image/jpeg",
      };

      (updateProductUseCase.execute as jest.Mock).mockResolvedValue(
        mockUpdatedProduct
      );

      const response = await request(app)
        .put("/products/prod123")
        .field("name", "Updated Product A")
        .field("category", "Updated Category")
        .field("price", "150")
        .field("description", "Updated description")
        .attach("image", Buffer.from("dummy file"), {
          filename: "updated-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedProduct);
      expect(updateProductUseCase.execute).toHaveBeenCalledWith({
        id: "prod123",
        name: "Updated Product A",
        category: "Updated Category",
        price: "150",
        description: "Updated description",
        imagePath: expect.any(String),
        mimetype: "image/jpeg",
      });
    });

    it("should return 404 if the product is not found", async () => {
      (updateProductUseCase.execute as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/products/prod123")
        .field("name", "Updated Product A")
        .field("category", "Updated Category")
        .field("price", "150")
        .field("description", "Updated description")
        .attach("image", Buffer.from("dummy file"), {
          filename: "updated-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });
  });

  describe("DELETE /products/:id - deleteProduct", () => {
    it("should delete a product", async () => {
      (deleteProductUseCase.execute as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete("/products/prod123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Product deleted successfully",
      });
      expect(deleteProductUseCase.execute).toHaveBeenCalledWith("prod123");
    });
  });
});

// describe("ProductUseCases", () => {
//   describe("CreateProductUseCase", () => {
//     let createProductUseCase: CreateProductUseCase;

//     beforeEach(() => {
//       createProductUseCase = new CreateProductUseCase(mockProductRepository);

//       jest.clearAllMocks();
//     });

//     it("should throw an error if required fields are missing", async () => {
//       const request = {
//         name: "",
//         category: "",
//         price: 0,
//         description: "",
//         imagePath: "",
//         mimetype: "",
//       };

//       await expect(createProductUseCase.execute(request)).rejects.toThrow(
//         "Missing required fields"
//       );

//       expect(fs.existsSync).not.toHaveBeenCalled();
//       expect(fs.readFileSync).not.toHaveBeenCalled();
//       expect(mockProductRepository.create).not.toHaveBeenCalled();
//     });

//     it("should throw an error if the image file does not exist", async () => {
//       (fs.existsSync as jest.Mock).mockReturnValue(false);

//       const request = {
//         name: "Test Product",
//         category: "Category",
//         price: 100,
//         description: "Description",
//         imagePath: "test-path/image.jpg",
//         mimetype: "image/jpeg",
//       };

//       await expect(createProductUseCase.execute(request)).rejects.toThrow(
//         "Error creating product: Image file not found"
//       );

//       expect(fs.existsSync).toHaveBeenCalledWith("test-path/image.jpg");
//       expect(fs.readFileSync).not.toHaveBeenCalled();
//       expect(mockProductRepository.create).not.toHaveBeenCalled();
//       expect(fs.unlinkSync).not.toHaveBeenCalled();
//     });

//     it("should throw an error if file read fails", async () => {
//       (fs.existsSync as jest.Mock).mockReturnValue(true);
//       (fs.readFileSync as jest.Mock).mockImplementation(() => {
//         throw new Error("File read error");
//       });

//       const request = {
//         name: "Test Product",
//         category: "Category",
//         price: 100,
//         description: "Description",
//         imagePath: "test-path/image.jpg",
//         mimetype: "image/jpeg",
//       };

//       await expect(createProductUseCase.execute(request)).rejects.toThrow(
//         "Error creating product: File read error"
//       );

//       expect(fs.existsSync).toHaveBeenCalledWith("test-path/image.jpg");
//       expect(fs.readFileSync).toHaveBeenCalledWith("test-path/image.jpg", {
//         encoding: "base64",
//       });
//       expect(mockProductRepository.create).not.toHaveBeenCalled();
//       expect(fs.unlinkSync).not.toHaveBeenCalled();
//     });

//     it("should handle unexpected errors during execution", async () => {
//       (fs.existsSync as jest.Mock).mockReturnValue(true);
//       (fs.readFileSync as jest.Mock).mockReturnValue("mocked-data");
//       mockProductRepository.create.mockImplementation(() => {
//         throw new Error("Unexpected repository error");
//       });

//       const request = {
//         name: "Test Product",
//         category: "Category",
//         price: 100,
//         description: "Description",
//         imagePath: "test-path/image.jpg",
//         mimetype: "image/jpeg",
//       };

//       await expect(createProductUseCase.execute(request)).rejects.toThrow(
//         "Error creating product: Unexpected repository error"
//       );

//       expect(fs.existsSync).toHaveBeenCalledWith("test-path/image.jpg");
//       expect(fs.readFileSync).toHaveBeenCalledWith("test-path/image.jpg", {
//         encoding: "base64",
//       });
//       expect(mockProductRepository.create).toHaveBeenCalled();
//       expect(fs.unlinkSync).not.toHaveBeenCalled(); // Error prevents cleanup
//     });
//   });

//   describe("DeleteProductUseCase", () => {
//     let deleteProductUseCase: DeleteProductUseCase;

//     beforeEach(() => {
//       deleteProductUseCase = new DeleteProductUseCase(mockProductRepository);
//     });

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it("should delete a product successfully", async () => {
//       const productId = randomUUID();

//       mockProductRepository.delete.mockResolvedValueOnce(undefined);

//       await deleteProductUseCase.execute(productId);

//       expect(mockProductRepository.delete).toHaveBeenCalledWith(productId);
//       expect(mockProductRepository.delete).toHaveBeenCalledTimes(1);
//     });

//     it("should throw an error if deletion fails", async () => {
//       const productId = randomUUID();
//       const errorMessage = "Database error";

//       mockProductRepository.delete.mockRejectedValueOnce(
//         new Error(errorMessage)
//       );

//       await expect(
//         deleteProductUseCase.execute(productId)
//       ).rejects.toThrowError(`Error deleting product: ${errorMessage}`);

//       expect(mockProductRepository.delete).toHaveBeenCalledWith(productId);
//       expect(mockProductRepository.delete).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("GetProductByIdUseCase", () => {
//     let getProductByIdUseCase: GetProductByIdUseCase;

//     beforeEach(() => {
//       getProductByIdUseCase = new GetProductByIdUseCase(mockProductRepository);
//     });

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it("should return a product DTO when product is found", async () => {
//       const productId = randomUUID();
//       const mockProduct: Product = {
//         id: productId,
//         name: "Test Product",
//         category: "Test Category",
//         price: 100,
//         description: "A description",
//         image: "image.jpg",
//       };

//       mockProductRepository.findById.mockResolvedValueOnce(mockProduct);

//       const result: ProductDTO | null = await getProductByIdUseCase.execute(
//         productId
//       );

//       expect(result).toEqual({
//         id: productId,
//         name: "Test Product",
//         category: "Test Category",
//         price: 100,
//         description: "A description",
//         image: "image.jpg",
//       });
//       expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
//     });

//     it("should return null if the product is not found", async () => {
//       const productId = randomUUID();

//       mockProductRepository.findById.mockResolvedValueOnce(null);

//       const result = await getProductByIdUseCase.execute(productId);

//       expect(result).toBeNull();
//       expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
//     });

//     it("should throw an error if the repository throws an error", async () => {
//       const productId = randomUUID();
//       const errorMessage = "Database error";

//       mockProductRepository.findById.mockRejectedValueOnce(
//         new Error(errorMessage)
//       );

//       await expect(
//         getProductByIdUseCase.execute(productId)
//       ).rejects.toThrowError(`Error fetching product by ID: ${errorMessage}`);
//       expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
//     });
//   });

//   describe("ListProductsByCategoryUseCase", () => {
//     let listProductsByCategoryUseCase: ListProductsByCategoryUseCase;

//     beforeEach(() => {
//       listProductsByCategoryUseCase = new ListProductsByCategoryUseCase(
//         mockProductRepository
//       );
//     });

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it("should return a list of product DTOs when products are found in the category", async () => {
//       const category = "Electronics";
//       const mockProducts: Product[] = [
//         {
//           id: randomUUID(),
//           name: "Product 1",
//           category: "Electronics",
//           price: 200,
//           description: "Description 1",
//           image: "image1.jpg",
//         },
//         {
//           id: randomUUID(),
//           name: "Product 2",
//           category: "Electronics",
//           price: 300,
//           description: "Description 2",
//           image: "image2.jpg",
//         },
//       ];

//       mockProductRepository.findByCategory.mockResolvedValueOnce(mockProducts);

//       const result: ProductDTO[] = await listProductsByCategoryUseCase.execute(
//         category
//       );

//       expect(result).toEqual([
//         {
//           id: "1",
//           name: "Product 1",
//           category: "Electronics",
//           price: 200,
//           description: "Description 1",
//           image: "image1.jpg",
//         },
//         {
//           id: "2",
//           name: "Product 2",
//           category: "Electronics",
//           price: 300,
//           description: "Description 2",
//           image: "image2.jpg",
//         },
//       ]);
//       expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(
//         category
//       );
//     });

//     it("should return an empty array if no products are found in the category", async () => {
//       const category = "Nonexistent Category";

//       mockProductRepository.findByCategory.mockResolvedValueOnce([]);

//       const result = await listProductsByCategoryUseCase.execute(category);

//       expect(result).toEqual([]);
//       expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(
//         category
//       );
//     });

//     it("should throw an error if the repository throws an error", async () => {
//       const category = "Electronics";
//       const errorMessage = "Database error";

//       mockProductRepository.findByCategory.mockRejectedValueOnce(
//         new Error(errorMessage)
//       );

//       await expect(
//         listProductsByCategoryUseCase.execute(category)
//       ).rejects.toThrowError(
//         `Error listing products by category: ${errorMessage}`
//       );
//       expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(
//         category
//       );
//     });
//   });

//   describe("UpdateProductUseCase", () => {
//     let mockProductRepository: jest.Mocked<IProductRepository>;
//     let updateProductUseCase: UpdateProductUseCase;

//     beforeEach(() => {
//       mockProductRepository = {
//         update: jest.fn(),
//         // Add other mock methods if necessary
//       } as unknown as jest.Mocked<IProductRepository>;

//       updateProductUseCase = new UpdateProductUseCase(mockProductRepository);
//     });

//     it("should update a product and return the updated ProductDTO", async () => {
//       const mockProduct: Product = {
//         id: randomUUID(),
//         name: "Updated Product",
//         category: "Category",
//         price: 100,
//         description: "Updated description",
//         image: "image-uri",
//       };

//       mockProductRepository.update.mockResolvedValueOnce(mockProduct);

//       const request = {
//         id: "123",
//         name: "Updated Product",
//         category: "Category",
//         price: 100,
//         description: "Updated description",
//       };

//       const result = await updateProductUseCase.execute(request);

//       expect(mockProductRepository.update).toHaveBeenCalledWith("123", {
//         name: "Updated Product",
//         category: "Category",
//         price: 100,
//         description: "Updated description",
//       });
//       expect(result).toEqual({
//         id: "123",
//         name: "Updated Product",
//         category: "Category",
//         price: 100,
//         description: "Updated description",
//         image: "image-uri",
//       });
//     });

//     it("should return null if the product is not found", async () => {
//       mockProductRepository.update.mockResolvedValueOnce(null);

//       const request = {
//         id: randomUUID(),
//         name: "Non-existent Product",
//       };

//       const result = await updateProductUseCase.execute(request);

//       expect(mockProductRepository.update).toHaveBeenCalledWith(randomUUID(), {
//         name: "Non-existent Product",
//       });
//       expect(result).toBeNull();
//     });

//     it("should throw an error if the repository throws an error", async () => {
//       mockProductRepository.update.mockRejectedValueOnce(
//         new Error("Repository error")
//       );

//       const request = {
//         id: randomUUID(),
//         name: "Error Product",
//       };

//       await expect(updateProductUseCase.execute(request)).rejects.toThrow(
//         "Error updating product: Repository error"
//       );

//       expect(mockProductRepository.update).toHaveBeenCalledWith(randomUUID(), {
//         name: "Error Product",
//       });
//     });

//     it("should handle requests without optional fields gracefully", async () => {
//       const mockProduct: Product = {
//         id: randomUUID(),
//         name: "Default Product",
//         category: "Default Category",
//         price: 0,
//         description: "",
//         image: "",
//       };

//       mockProductRepository.update.mockResolvedValueOnce(mockProduct);

//       const request = {
//         id: randomUUID(),
//       };

//       const result = await updateProductUseCase.execute(request);

//       expect(mockProductRepository.update).toHaveBeenCalledWith(
//         randomUUID(),
//         {}
//       );
//       expect(result).toEqual({
//         id: randomUUID(),
//         name: "Default Product",
//         category: "Default Category",
//         price: 0,
//         description: "",
//         image: "",
//       });
//     });
//   });
// });
