// Importações dos casos de uso e repositórios
import { CreateProductUseCase } from '../../core/use_cases/CreateProductUseCase';
import { UpdateProductUseCase } from '../../core/use_cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../core/use_cases/DeleteProductUseCase';
import { GetProductByIdUseCase } from '../../core/use_cases/GetProductByIdUseCase';
import { ListProductsByCategoryUseCase } from '../../core/use_cases/ListProductsByCategoryUseCase';
import { MongoProductRepository } from '../../external/database/mongoDB/persistence/MongoProductRepository';

import { CreateOrderUseCase } from '../../core/use_cases/CreateOrderUseCase';
import { GetOrderPaymentStatusUseCase } from '../../core/use_cases/GetOrderPaymentStatusUseCase';
import { GetOrdersUseCase } from '../../core/use_cases/GetOrdersUseCase';
import { GetOrdersByStatusUseCase } from '../../core/use_cases/GetOrdersByStatusUseCase';
import { UpdateOrderStatusUseCase } from '../../core/use_cases/UpdateOrderStatusUseCase';
import { MongoOrderRepository } from '../../external/database/mongoDB/persistence/MongoOrderRepository';

import { CreateUserUseCase } from '../../core/use_cases/CreateUserUseCase';
import { GetUserByCpfUseCase } from '../../core/use_cases/GetUserByCpfUseCase';
import { MongoUserRepository } from '../../external/database/mongoDB/persistence/MongoUserRepository';

import { CreatePixPaymentUseCase } from '../../core/use_cases/CreatePixPaymentUseCase';
import { PaymentService } from '../../adapters/gateway/MercadoPagoGateway';

// Instanciando o repositório de produtos
const productRepository = new MongoProductRepository();

// Instanciando o repositório de usuários
const userRepository = new MongoUserRepository();

// Instanciando o repositório de pedidos
const orderRepository = new MongoOrderRepository();

// Instanciando os casos de uso de produtos com o repositório
const createProductUseCase = new CreateProductUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
const listProductsByCategoryUseCase = new ListProductsByCategoryUseCase(productRepository);

// Instanciando os casos de uso de pedidos
const createOrderUseCase = new CreateOrderUseCase(orderRepository, userRepository, productRepository);
const getOrderPaymentStatusUseCase = new GetOrderPaymentStatusUseCase(orderRepository);
const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
const getOrdersByStatusUseCase = new GetOrdersByStatusUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

// Instanciando os casos de uso de usuários
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserByCpfUseCase = new GetUserByCpfUseCase(userRepository);

// Instanciando os casos de uso de pagamentos
const paymentService = new PaymentService();
const createPixPaymentUseCase = new CreatePixPaymentUseCase(paymentService);

// Exportando os casos de uso diretamente para uso em outras partes da aplicação
export {
    createProductUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    getProductByIdUseCase,
    listProductsByCategoryUseCase,
    createOrderUseCase,
    getOrderPaymentStatusUseCase,
    getOrdersUseCase,
    getOrdersByStatusUseCase,
    updateOrderStatusUseCase,
    createUserUseCase,
    getUserByCpfUseCase,
    createPixPaymentUseCase
};
