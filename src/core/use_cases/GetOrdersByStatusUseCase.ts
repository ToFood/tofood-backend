import { OrderDTO } from "../../adapters/dtos/OrderDTO";
import { IOrderRepository } from "../../adapters/repositories/IOrderRepository";
import { Order } from "../entities/Order";

export class GetOrdersByStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(status: any): Promise<OrderDTO[]> {
    try {
      // Verificar se o status foi fornecido e se é um array
      if (!status || !Array.isArray(status)) {
        throw new Error("Status must be provided as an array");
      }

      // Buscar pedidos pelo status
      const orders: Order[] = await this.orderRepository.findByStatus(status);

      // Converter os pedidos para DTO
      return orders.map((order) => this.toDTO(order));
    } catch (error: any) {
      // Lançar uma exceção com mensagem de erro
      throw new Error(`Failed to retrieve orders by status: ${error.message}`);
    }
  }

  // Método privado para converter a entidade Order em OrderDTO
  private toDTO(order: Order): OrderDTO {
    return {
      _id: order._id,
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
