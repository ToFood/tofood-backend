import express, { Request, Response } from "express";
import multer from "multer";
import {
  createProductUseCase,
  deleteProductUseCase,
  getProductByIdUseCase,
  listProductsByCategoryUseCase,
  updateProductUseCase,
} from "../../config/di/container";
import { ProductDTO } from "../dtos/ProductDTO"; // Importing the DTO

const router = express.Router();
const upload = multer({ dest: "uploads/" });

class ProductController {
  /**
   * [Criar Produto]
   * Recebe os dados da requisição e chama o caso de uso para criar o produto.
   */
  static createProduct = async (req: Request, res: Response) => {
    try {
      const { name, category, price, description, image } = req.body;
      const imagePath = req.file?.path || "";

      if (!name || !category || !price || !description) {
        return res.status(400).send({ error: "Missing required fields" });
      }

      // Delegate execution to the use case
      const newProduct: ProductDTO = await createProductUseCase.execute({
        name,
        category,
        price,
        description,
        imagePath,
        mimetype: req.file?.mimetype || "",
      });

      res.status(201).send(newProduct);
    } catch (error: any) {
      res
        .status(500)
        .send({ error: error.message || "Error creating product" });
    }
  };

  /**
   * [Atualizar Produto]
   * Recebe os dados da requisição e chama o caso de uso para atualizar o produto.
   */
  static updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, category, price, description } = req.body;
      const imagePath = req.file?.path || "";

      if (!name || !category || !price || !description) {
        return res.status(400).send({ error: "Missing required fields" });
      }

      // Delegate execution to the use case
      const updatedProduct: ProductDTO | null =
        await updateProductUseCase.execute({
          id,
          name,
          category,
          price,
          description,
          imagePath,
          mimetype: req.file?.mimetype || "",
        });

      if (updatedProduct) {
        return res.status(200).send(updatedProduct);
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    } catch (error: any) {
      res
        .status(500)
        .send({ error: error.message || "Error updating product" });
    }
  };

  /**
   * [Deletar Produto]
   * Recebe o ID do produto e chama o caso de uso para deletá-lo.
   */
  static deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Delegate execution to the use case
      await deleteProductUseCase.execute(id);

      res.status(200).send({ message: "Product deleted successfully" });
    } catch (error: any) {
      res
        .status(500)
        .send({ error: error.message || "Error deleting product" });
    }
  };

  /**
   * [Buscar Produto por ID]
   * Recebe o ID do produto e chama o caso de uso para buscá-lo.
   */
  static getProductById = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).send({ message: "Product ID is required" });
      }

      // Delegate execution to the use case
      const product: ProductDTO | null = await getProductByIdUseCase.execute(
        String(productId)
      );

      if (product) {
        return res.status(200).send(product);
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    } catch (error: any) {
      res
        .status(500)
        .send({ error: error.message || "Error fetching product" });
    }
  };

  /**
   * [Listar Produtos por Categoria]
   * Recebe a categoria e chama o caso de uso para listar os produtos da categoria.
   */
  static listProductByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).send({ message: "Category is required" });
      }

      // Delegate execution to the use case
      const productsByCategory: ProductDTO[] =
        await listProductsByCategoryUseCase.execute(category);

      if (productsByCategory.length > 0) {
        return res.status(200).send(productsByCategory);
      } else {
        return res
          .status(404)
          .send({ message: "No products found in this category" });
      }
    } catch (error: any) {
      res.status(500).send({
        message: `Error fetching products by category: ${
          error.message || "Unknown error"
        }`,
      });
    }
  };
}

router.get("/products/:productId", ProductController.getProductById);
router.get(
  "/products/category/:category",
  ProductController.listProductByCategory
);
router.post(
  "/products",
  upload.single("image"),
  ProductController.createProduct
);
router.put(
  "/products/:id",
  upload.single("image"),
  ProductController.updateProduct
);
router.delete("/products/:id", ProductController.deleteProduct);

export default router;
