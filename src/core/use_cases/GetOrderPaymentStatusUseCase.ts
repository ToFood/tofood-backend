import { IOrderRepository } from '../../adapters/repositories/IOrderRepository';
import { OrderDTO } from '../../adapters/dtos/OrderDTO';

export class GetOrderPaymentStatusUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(orderId: string): Promise<string> {
        try {
            // Verificar se o orderId foi fornecido
            if (!orderId) {
                throw new Error('Order ID must be provided');
            }

            // Buscar o pedido pelo ID
            const order: OrderDTO | null = await this.orderRepository.findById(orderId);
            
            // Verificar se o pedido foi encontrado
            if (!order) {
                throw new Error('Order not found');
            }

            // Retornar o status do pagamento
            return order.paymentStatus;
        } catch (error: any) {
            // Captura de erros e lançamento de mensagem apropriada
            throw new Error(`Failed to retrieve order payment status: ${error.message}`);
        }
    }
}

export default GetOrderPaymentStatusUseCase;
