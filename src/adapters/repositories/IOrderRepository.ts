import { Order } from "../../core/entities/Order";

export interface IOrderRepository {
  findById(orderId: string): Promise<Order | null>;

  save(order: any): Promise<Order>;

  findByStatus(status: string[]): Promise<Order[]>;

  findAll(): Promise<Order[]>;

  updateById(
    orderId: string,
    updateData: Partial<Order>
  ): Promise<Order | null>;
}
