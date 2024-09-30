import { IOrderRepository } from '../../adapters/repositories/IOrderRepository';
import { OrderDTO } from '../../adapters/dtos/OrderDTO';
import { Order } from '../entities/Order';
import { ORDER_STATUSES } from '../../external/database/mongoDB/frameworks/mongoose/models/OrderModel';

export class UpdateOrderStatusUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(orderId: string, updateData: { payment?: string; status?: (typeof ORDER_STATUSES)[number] }): Promise<OrderDTO | null> {
        try {
            // Verificar se o orderId foi fornecido
            if (!orderId) {
                throw new Error("Order ID must be provided");
            }

            // Verificar se pelo menos um dos campos de atualização foi fornecido
            if (!updateData.payment && !updateData.status) {
                throw new Error("At least one field (payment or status) must be provided for update");
            }

            // Atualizar o pedido com os novos dados fornecidos
            const updatedOrder: Order | null = await this.orderRepository.updateById(orderId, updateData);

            // Se o pedido não foi encontrado, lançar erro
            if (!updatedOrder) {
                throw new Error("Order not found");
            }

            // Converter o pedido atualizado para DTO
            return this.toDTO(updatedOrder);
        } catch (error: any) {
            // Captura de erros e lançamento de mensagem apropriada
            throw new Error(`Failed to update order status: ${error.message}`);
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

export default UpdateOrderStatusUseCase;
