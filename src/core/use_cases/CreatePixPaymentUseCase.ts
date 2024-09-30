import { PaymentService } from '../../adapters/gateway/MercadoPagoGateway';
import { Order } from '../entities/Order'; // Certifique-se de importar corretamente a entidade Order

export class CreatePixPaymentUseCase {
    constructor(private paymentService: PaymentService) { }

    /**
     * Executa o pagamento Pix para a entidade Order.
     * @param order - Entidade Order contendo todos os dados necessários.
     */
    async execute(order: Order) {
        return this.paymentService.createPixPayment(order);
    }
}
