import { IOrderRepository } from '../../adapters/repositories/IOrderRepository';
import { OrderDTO } from '../../adapters/dtos/OrderDTO';
import { Order } from '../entities/Order';
import { ORDER_STATUSES } from '../../external/database/mongoDB/frameworks/mongoose/models/OrderModel';

export class UpdateOrderStatusUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async ) {
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
