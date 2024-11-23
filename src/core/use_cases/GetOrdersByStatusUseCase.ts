import { OrderDTO } from "../../adapters/dtos/OrderDTO";
import { IOrderRepository } from "../../adapters/repositories/IOrderRepository";
import { Order } from "../entities/Order";

export class GetOrdersByStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

      user: order.user,
      status: order.status,
      orderProducts: order.orderProducts,
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    };
  }
}

export default GetOrdersByStatusUseCase;
