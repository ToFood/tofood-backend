// src/infrastructure/persistence/MongoOrderRepository.ts

import { IOrderRepository } from "../../../../adapters/repositories/IOrderRepository";
import { Order } from "../../../../core/entities/Order";
import OrderModel from "../frameworks/mongoose/models/OrderModel";

export class MongoOrderRepository implements IOrderRepository {
  async findById(orderId: string): Promise<Order | null> {
    const orderData: Order | null = await OrderModel.findById(orderId)
      .populate("user")
      .populate("orderProducts.product")
      .lean();
    if (!orderData) return null;

    return new Order(
      (orderData._id as unknown as string).toString(),
      orderData.user,
      orderData.status,
      orderData.orderProducts.map((p) => ({
        product: p.product,
        price: p.price,
        quantity: p.quantity,
      })),
      orderData.createdAt,
      orderData.paymentStatus,
      orderData.totalAmount
    );
  }

  async save(order: any): Promise<Order> {
    // Create a new OrderModel instance
    const orderModel = new OrderModel({
        user: order?.user?._id, // Aqui garantimos que o campo user está sendo passado corretamente como ID
        status: order.status,
        orderProducts: order?.orderProducts?.map((p) => ({
            product: p.product._id, // Aqui garantimos que o produto está sendo salvo como ID
            quantity: p.quantity,
            price: p.price,
        })),
        createdAt: order.createdAt,
        payment: order.paymentStatus,
        totalAmount: order.totalAmount,
    });

    // Save the order in the database
    const savedOrder: any = await orderModel.save();

    // Populate user and product fields
    const populatedOrder = await savedOrder
      .populate("user")
      .populate("orderProducts.product")
      .execPopulate();

    // Return the new Order instance
    return new Order(
      (populatedOrder._id as unknown as string).toString(),
      populatedOrder.user,
      populatedOrder.status,
      populatedOrder.orderProducts.map((p) => ({
        product: p.product,
        price: p.price,
        quantity: p.quantity,
      })),
      populatedOrder.createdAt,
      populatedOrder.payment,
      populatedOrder.totalAmount
    );
}


  async findByStatus(status: string[]): Promise<Order[]> {
    const ordersData: Order[] = await OrderModel.find({
      status: { $in: status },
    })
      .populate("user")
      .populate("orderProducts.product")
      .lean();

    return ordersData.map((orderData) => {
      const orderProductsData = orderData.orderProducts.map((orderProduct) => ({
        product: orderProduct.product,
        price: orderProduct.price,
        quantity: orderProduct.quantity,
      }));

      return new Order(
        orderData._id.toString(),
        orderData.user,
        orderData.status,
        orderProductsData,
        orderData.createdAt,
        orderData.paymentStatus,
        orderData.totalAmount
      );
    });
  }

  async findAll(): Promise<Order[]> {
    const ordersData: Order[] = await OrderModel.find()
      .populate("user")
      .populate("orderProducts.product")
      .lean();

    return ordersData.map((orderData) => {
      const orderProductsData = orderData.orderProducts.map((orderProduct) => ({
        product: orderProduct.product,
        price: orderProduct.price,
        quantity: orderProduct.quantity,
      }));

      return new Order(
        orderData._id.toString(),
        orderData.user,
        orderData.status,
        orderProductsData,
        orderData.createdAt,
        orderData.paymentStatus,
        orderData.totalAmount
      );
    });
  }

  async updateById(
    orderId: string,
    updateData: Partial<Order>
  ): Promise<Order | null> {
    const updatedOrderData: Order | null = await OrderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    )
      .populate("user")
      .populate("orderProducts.product")
      .lean();
    if (!updatedOrderData) return null;
    return new Order(
      (updatedOrderData._id as unknown as string).toString(),
      updatedOrderData.user,
      updatedOrderData.status,
      updatedOrderData.orderProducts.map((orderProduct) => ({
        product: orderProduct.product,
        price: orderProduct.price,
        quantity: orderProduct.quantity,
      })),
      updatedOrderData.createdAt,
      updatedOrderData.paymentStatus,
      updatedOrderData.totalAmount,
    );
  }
}
