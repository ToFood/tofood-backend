import mongoose, { Document, Schema } from "mongoose";
import { ProductDTO } from "../../../../../../adapters/dtos/ProductDTO";

// Define possíveis valores para status e pagamento
export const ORDER_STATUSES = [
  "OPENED",
  "RECEIVED",
  "PREPARING",
  "CLOSED",
  "FINISHED",
  "CANCELED",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "UNPAID",
  "REJECTED",
] as const;

// Define a interface para o documento de pedido
interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  status: (typeof ORDER_STATUSES)[number];
  orderProducts: Array<{
    product: ProductDTO;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  totalAmount: number;
}

// Define o esquema Mongoose para a coleção de pedidos
const OrderSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, required: true, enum: ORDER_STATUSES },
  orderProducts: [
    {
      product: {
        id: { type: String },
        name: { type: String },
        category: { type: String },
        price: { type: Number },
        description: { type: String },
        image: { type: String },
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, required: true, enum: PAYMENT_STATUSES },
  totalAmount: { type: Number, required: true },
});

// Cria e exporta o modelo Mongoose
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;
