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

const app = express();
app.use(express.json());
app.use(router);

describe("ProductController", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
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
        imagePath: expect.any(String), // Path will be dynamically generated
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
