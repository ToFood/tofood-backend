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

    if (!orderId) {
      return res
        .status(400)
        .send({ message: "Order ID query parameter is required" });
    }

    try {
      const orderIdString = String(orderId);

      const paymentStatus = await getOrderPaymentStatusUseCase.execute(
        orderIdString
      );

      return res.status(200).send({ paymentStatus });
    } catch (error: any) {
      return res.status(500).send({
        message: `Failed to retrieve payment status: ${error.message}`,
      });
    }
  };

  /*[LISTAR TODOS OS PEDIDOS] */
  static getOrders = async (req: Request, res: Response) => {
    const orders = await getOrdersUseCase.execute();
    res.status(200).send(orders);
  };

  /*[LISTAR PEDIDOS POR STATUS] */
  static getOrderByStatus = async (req: Request, res: Response) => {
    const { status } = req.query;

    if (!status) {
      return res
        .status(400)
        .send({ message: "Status query parameter is required" });
    }

    try {
      const statuses = Array.isArray(status) ? status : [status];

      const ordersByStatus = await getOrdersByStatusUseCase.execute(statuses);

      if (!ordersByStatus || ordersByStatus.length === 0) {
        return res
          .status(404)
          .send({ message: "No orders found for the specified status" });
      }

      return res.status(200).send(ordersByStatus);
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Failed to retrieve orders by status" });
    }
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

    return res.status(200).json({
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
