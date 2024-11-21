import express, { Request, Response } from "express";
import {
  createOrderUseCase,
  getOrderPaymentStatusUseCase,
  getOrdersByStatusUseCase,
  getOrdersUseCase,
  updateOrderStatusUseCase,
} from "../../config/di/container";

const router = express.Router();

class OrderController {
  /*[CRIAR ORDER] */
  static createOrder = async (req: Request, res: Response) => {
    const { userCpf, products } = req.body;

    // Chamando diretamente o use case, sem try-catch aqui
    const newOrder = await createOrderUseCase.execute(userCpf, products);

    res.status(201).send(newOrder);
  };

  /*[CONSULTAR STATUS DO PAGAMENTO DO PEDIDO] */
  static getOrderPaymentStatus = async (req: Request, res: Response) => {
    const { orderId } = req.query;

    const paymentStatus = await getOrderPaymentStatusUseCase.execute(
      String(orderId)
    );

    res.status(200).send({ paymentStatus });
  };

  /*[LISTAR TODOS OS PEDIDOS] */
  static getOrders = async (req: Request, res: Response) => {
    const orders = await getOrdersUseCase.execute();
    res.status(200).send(orders);
  };

  /*[LISTAR PEDIDOS POR STATUS] */
  static getOrderByStatus = async (req: Request, res: Response) => {
    const { status } = req.query;
    const ordersByStatus = await getOrdersByStatusUseCase.execute(
      [status].flat() as string[]
    );
    res.status(200).send(ordersByStatus);
  };

  /*[ATUALIZAR STATUS DO PEDIDO] */
  static updateOrderStatus = async (req: Request, res: Response) => {
    const { id: orderId } = req.params;
    const { paymentStatus, status } = req.body;

    const updatedOrder = await updateOrderStatusUseCase.execute(orderId, {
      paymentStatus,
      status,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res
      .status(200)
      .json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
  };
}

router.get("/orders", OrderController.getOrders);
router.get("/orders/status", OrderController.getOrderByStatus);
router.get("/order/payment/status", OrderController.getOrderPaymentStatus);
router.post("/orders", OrderController.createOrder);
router.put("/order/:id/status", OrderController.updateOrderStatus);

export default router;
