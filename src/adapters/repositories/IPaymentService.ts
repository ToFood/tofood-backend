import { Order } from "../../core/entities/Order";
import { PaymentCreateResponse } from "../../core/entities/Payment";

export interface IPaymentService {
    createPixPayment(order: Order): Promise<PaymentCreateResponse>;
    setWebhookUrl(url: string): void;
}