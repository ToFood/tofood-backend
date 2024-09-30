import { IOrderRepository } from '../../adapters/repositories/IOrderRepository';
import { IUserRepository } from '../../adapters/repositories/IUserRepository';
import { IProductRepository } from '../../adapters/repositories/IProductRepository';
import { Order } from '../entities/Order';
import { OrderDTO } from '../../adapters/dtos/OrderDTO';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../external/database/mongoDB/frameworks/mongoose/models/OrderModel';

interface ProductOrder {
    productId: string;
    quantity: number;
}

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private userRepository: IUserRepository,
        private productRepository: IProductRepository
    ) { }

    async execute(userCpf: string, products: ProductOrder[]): Promise<OrderDTO> {
        try {
            // Verificar se "products" é um array
            if (!Array.isArray(products)) {
                throw new Error("Products must be an array");
            }

            // Verificar se o usuário existe
            const user = await this.userRepository.findByCpf(userCpf);
            if (!user) {
                throw new Error('User not found');
            }

            const orderProducts = await Promise.all(
                products.map(async (product) => {
                    const productData = await this.productRepository.findById(product.productId);
                    if (!productData) {
                        throw new Error(`Product with ID ${product.productId} not found`);
                    }
            
                    // Retornando o objeto `Product` completo
                    return {
                        product: productData, // Passar o objeto Product completo
                        quantity: product.quantity,
                        price: productData.price
                    };
                })
            );

            // Calcular o valor total do pedido
            const totalAmount = orderProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);

            // Criar a entidade Order
            const order = new Order(
                'generated-id',
                user, // Objeto User
                ORDER_STATUSES[0], // Status inicial como "OPENED"
                orderProducts, // Lista de { product: Product, quantity: number, price: number }
                new Date(), // Data de criação
                PAYMENT_STATUSES[0], // Status de pagamento "PENDING"
                totalAmount // Total calculado
            );

            // Salvar o pedido no repositório
            const savedOrder = await this.orderRepository.save(order);

            // Retornar um DTO
            return {
                _id: savedOrder._id,
                user: savedOrder.user,
                status: savedOrder.status,
                orderProducts: savedOrder.orderProducts,
                createdAt: savedOrder.createdAt,
                paymentStatus: savedOrder.paymentStatus,
                totalAmount: savedOrder.totalAmount
            };

        } catch (error: any) {
            // Tratamento de erro específico aqui
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }
}
