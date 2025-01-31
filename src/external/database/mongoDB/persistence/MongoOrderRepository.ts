// src/infrastructure/persistence/MongoOrderRepository.ts

import { IOrderRepository } from "../../../../adapters/repositories/IOrderRepository";
import { Order } from "../../../../core/entities/Order";
import OrderModel from "../frameworks/mongoose/models/OrderModel";

export class MongoOrderRepository implements IOrderRepository {
  async findById(orderId: string): Promise<Order | null> {
    const orderData: Order | null = await OrderModel.findById(orderId)
      .populate("user")
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
      user: order?.user?._id,
      status: order.status,
      orderProducts: order?.orderProducts?.map((p) => ({
        product: p.product._id,
        quantity: p.quantity,
        price: p.price,
      })),
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    });

    const savedOrder = await orderModel.save();

    if (!savedOrder || !(savedOrder instanceof OrderModel)) {
      throw new Error("Saved order is not a valid Mongoose document.");
    }

    // Populate user and product fields
    const populatedOrder = await OrderModel.findById(savedOrder._id)
      .populate("user")
      .exec();

    if (!populatedOrder) {
      throw new Error("Order not found after saving.");
    }

    // Return the new Order instance
    return new Order(
      (populatedOrder._id as unknown as string).toString(),
      populatedOrder.user as any,
      populatedOrder.status,
      populatedOrder.orderProducts.map((p) => ({
        product: p.product,
        price: p.price,
        quantity: p.quantity,
      })) as any,
      populatedOrder.createdAt,
      populatedOrder.paymentStatus,
      populatedOrder.totalAmount
    );
  }

  async findByStatus(status: string[]): Promise<Order[]> {
    const ordersData: Order[] = await OrderModel.find({
      status: { $in: status },
    })
      .populate("user")
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
    const ordersData: Order[] = await OrderModel.find().populate("user").lean();

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
      updatedOrderData.totalAmount
    );
  }
}
