import express, { Request, Response } from "express";
import {
  createPixPaymentUseCase,
  getOrdersUseCase,
  updateOrderStatusUseCase,
} from "../../config/di/container"; 
import { fetchPaymentDetails, mapPaymentStatusToOrderStatus } from "../../pkg/middleware/utils";
import { Order } from "../../core/entities/Order";
import { ORDER_STATUSES } from "../../external/database/mongoDB/frameworks/mongoose/models/OrderModel";

const router = express.Router();

class PaymentController {
  /*[PAGAR ORDER]
    Recebe o ID do pedido, busca o pedido e processa o pagamento via Pix.
  */
  static orderPayment = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;

      // Validação do ID do pedido
      if (!orderId) {
        return res.status(400).json({ error: "Pedido inválido" });
      }

      // Busca o pedido diretamente pelo use case
      const orderDTO = await getOrdersUseCase.getOrderById(orderId);
      if (!orderDTO) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      // Converter OrderDTO para Order (entidade completa)
      const order = new Order(
        orderDTO._id,
        orderDTO.user,
        orderDTO.status,
        orderDTO.orderProducts,
        new Date(orderDTO.createdAt),
        orderDTO.paymentStatus,
        orderDTO.totalAmount
      );

      // Processa o pagamento Pix utilizando o use case apropriado
      const response = await createPixPaymentUseCase.execute(order);

      return res.status(201).json(response);
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      return res.status(500).json({ error: error.message });
    }
  };

  // [WEBHOOK para atualizações]
  static webhook = async (req: Request, res: Response) => {
    try {
      const notification = req.body;

      console.log("Received notification:", notification);

      if (notification.type === "payment") {
        const paymentId = notification.data.id;

        // Obtém os detalhes do pagamento usando um método auxiliar
        const paymentDetails = await fetchPaymentDetails(paymentId);

        const orderId = paymentDetails.external_reference;
        const orderPaymentStatus = mapPaymentStatusToOrderStatus(paymentDetails.status);

        // Use o tipo correto para 'orderStatus'
        let orderStatus: (typeof ORDER_STATUSES)[number] = ORDER_STATUSES[0]; // "OPENED"

        if (orderPaymentStatus === "PAID") {
          orderStatus = ORDER_STATUSES[1]; // "RECEIVED"
        } else if (orderPaymentStatus === "CANCELED") {
          orderStatus = ORDER_STATUSES[5]; // "CANCELED"
        }

        await updateOrderStatusUseCase.execute(orderId, {
          payment: orderPaymentStatus,
          status: orderStatus,
        });
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error("Erro ao processar notificação:", error);
      res.sendStatus(500);
    }
  };
}

router.post("/webhook", PaymentController.webhook);
router.post("/orderPayment", PaymentController.orderPayment);

export default router;
