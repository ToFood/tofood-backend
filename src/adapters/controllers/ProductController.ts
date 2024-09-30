import express, { Request, Response } from "express";
import multer from "multer";
import {
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductByIdUseCase,
  listProductsByCategoryUseCase,
} from "../../config/di/container"; 
import { ProductDTO } from "../dtos/ProductDTO";  // Importando o DTO

const router = express.Router();
const upload = multer({ dest: "uploads/" });

class ProductController {



  /**
   * [Criar Produto]
   * Recebe os dados da requisição e chama o caso de uso para criar o produto.
   */
  static createProduct = async (req: Request, res: Response) => {
    const { name, category, price, description } = req.body;
    const imagePath = req.file?.path || "";

    // Delegar a execução ao caso de uso
    const newProduct: ProductDTO = await createProductUseCase.execute({
      name,
      category,
      price,
      description,
      imagePath,
      mimetype: req.file?.mimetype || "",
    });

    res.status(201).send(newProduct);
  };



  /**
   * [Atualizar Produto]
   * Recebe os dados da requisição e chama o caso de uso para atualizar o produto.
   */
  static updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, price, description } = req.body;
    const imagePath = req.file?.path || "";

    // Delegar a execução ao caso de uso
    const updatedProduct: ProductDTO | null = await updateProductUseCase.execute({
      id,
      name,
      category,
      price,
      description,
      imagePath,
      mimetype: req.file?.mimetype || "",
    });

    res.status(updatedProduct ? 200 : 404).send(updatedProduct || { message: "Product not found" });
  };




  /**
   * [Deletar Produto]
   * Recebe o ID do produto e chama o caso de uso para deletá-lo.
   */
  static deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delegar a execução ao caso de uso
    await deleteProductUseCase.execute(id);

    res.status(200).send({ message: "Product deleted successfully" });
  };




  /**
   * [Buscar Produto por ID]
   * Recebe o ID do produto e chama o caso de uso para buscá-lo.
   */
  static getProductById = async (req: Request, res: Response) => {
    const { productId } = req.params;

    // Delegar a execução ao caso de uso
    const product: ProductDTO | null = await getProductByIdUseCase.execute(String(productId));

    res.status(product ? 200 : 404).send(product || { message: "Product not found" });
  };



  
  /**
   * [Listar Produtos por Categoria]
   * Recebe a categoria e chama o caso de uso para listar os produtos da categoria.
   */
  static listProductByCategory = async (req: Request, res: Response) => {
    const { category } = req.params;

    // Delegar a execução ao caso de uso
    const productsByCategory: ProductDTO[] = await listProductsByCategoryUseCase.execute(category);

    res.status(200).send(productsByCategory);
  };
}

router.get("/products/:productId", ProductController.getProductById);
router.get("/products/category/:category", ProductController.listProductByCategory);
router.post("/products", upload.single("image"), ProductController.createProduct);
router.put("/products/:id", upload.single("image"), ProductController.updateProduct);
router.delete("/products/:id", ProductController.deleteProduct);

export default router;
