import { IOrderRepository } from '../../adapters/repositories/IOrderRepository';
import { OrderDTO } from '../../adapters/dtos/OrderDTO';
import { Order } from '../entities/Order';
import { ORDER_STATUSES } from '../../external/database/mongoDB/frameworks/mongoose/models/OrderModel';

export class GetOrdersUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(): Promise<OrderDTO[]> {
        try {
            // Buscar todos os pedidos
            const orders: Order[] = await this.orderRepository.findAll();

            // Filtrar pedidos excluindo os finalizados
            const filteredOrders = orders.filter(order => order.status !== ORDER_STATUSES[4]);

            // Converter os pedidos para DTO
            return filteredOrders.map(order => this.toDTO(order));
        } catch (error: any) {
            // Lançar uma exceção com mensagem de erro
            throw new Error(`Failed to retrieve orders: ${error.message}`);
        }
    }

    async getO
            // Verificar se o orderId foi fornecido
            if (!orderId) {
                throw new Error("Order ID must be provided");
            }

            // Buscar o pedido pelo ID
            const order = await this.orderRepository.findById(orderId);
            
            // Verificar se o pedido foi encontrado
            if (!order) {
                throw new Error("Order not found");
            }

            // Converter o pedido para DTO
            return this.toDTO(order);
        } catch (error: any) {
            // Lançar uma exceção com mensagem de erro
            throw new Error(`Failed to retrieve order by ID: ${error.message}`);
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

export default GetOrdersUseCase;
