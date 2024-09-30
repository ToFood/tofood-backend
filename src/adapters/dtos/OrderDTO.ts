import { Product } from "../../core/entities/Product";
import { User } from "../../core/entities/User";
import { PAYMENT_STATUSES, ORDER_STATUSES } from "../../external/database/mongoDB/frameworks/mongoose/models/OrderModel";

export interface OrderDTO {
  _id: string;
  user: User;
  status: (typeof ORDER_STATUSES)[number];
  orderProducts: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  totalAmount: number;
}
