import { MercadoPagoConfig, Payment } from "mercadopago";
import { Order } from "../../core/entities/Order";

export class PaymentService {
  private payment: Payment;
  static webhookUrl: string = "";

  constructor() {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });

    this.payment = new Payment(client);
  }

  /**
   * Define a URL de webhook para notificações de pagamento.
   */
  static setWebhookUrl(url: string) {
    this.webhookUrl = url;
  }

  /**
   * Cria um pagamento Pix para o pedido especificado.
   * @param order - O pedido para o qual o pagamento será processado.
   */
  async createPixPayment(order: Order) {
    try {
      console.log(PaymentService.webhookUrl);

      const response = await this.payment.create({
        body: {
          transaction_amount: order.totalAmount,
          description: `Pagamento do pedido ${order._id}`,
          payment_method_id: "pix",
          payer: {
            email: "teste@teste.com",//order.user.email,
            first_name: "teste",//order.user.name,
            identification: {
              type: "CPF",
              number: "43289601804"//order.user.cpf,
            },
          },
          notification_url: PaymentService.webhookUrl,
        },
        requestOptions: { idempotencyKey: order._id },
      });

      return response;
    } catch (error: any) {
      console.error("Erro ao criar pagamento PIX:", error.response ? error.response.data : error.message);
      throw new Error(`Erro ao criar pagamento PIX: ${error.message}`);
    }
  }
}

export default PaymentService;
