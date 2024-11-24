import express from "express";
import request from "supertest";
import router from "../adapters/controllers/OrderController";
import { OrderDTO } from "../adapters/dtos/OrderDTO";
import {
  createOrderUseCase,
  getOrderPaymentStatusUseCase,
  getOrdersByStatusUseCase,
  getOrdersUseCase,
  updateOrderStatusUseCase,
} from "../config/di/container";
import { Order } from "../core/entities/Order";
import { CreateOrderUseCase } from "../core/use_cases/CreateOrderUseCase";
import GetOrderPaymentStatusUseCase from "../core/use_cases/GetOrderPaymentStatusUseCase";
import GetOrdersByStatusUseCase from "../core/use_cases/GetOrdersByStatusUseCase";
import GetOrdersUseCase from "../core/use_cases/GetOrdersUseCase";
import UpdateOrderStatusUseCase from "../core/use_cases/UpdateOrderStatusUseCase";
import { ORDER_STATUSES } from "../external/database/mongoDB/frameworks/mongoose/models/OrderModel";

jest.mock("../config/di/container", () => ({
  createOrderUseCase: { execute: jest.fn() },
  getOrderPaymentStatusUseCase: { execute: jest.fn() },
  getOrdersUseCase: { execute: jest.fn() },
  getOrdersByStatusUseCase: { execute: jest.fn() },
  updateOrderStatusUseCase: { execute: jest.fn() },
}));

const mockOrderRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByStatus: jest.fn(),
  findAll: jest.fn(),
  updateById: jest.fn(),
};

const mockUserRepository = {
  create: jest.fn(),
  findByCpf: jest.fn(),
};

const mockProductRepository = {
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByCategory: jest.fn(),
};

const app = express();
app.use(express.json());
app.use(router);

describe("OrderController", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe("POST /orders - createOrder", () => {
    it("should create a new order and return 201", async () => {
      const mockOrder = {
        _id: "order123",
        user: { cpf: "12345678900", name: "John Doe" },
        status: "OPENED",
        orderProducts: [{ product: "prod1", quantity: 2, price: 20 }],
        createdAt: new Date().toString(),
        paymentStatus: "PENDING",
        totalAmount: 40,
      };

      (createOrderUseCase.execute as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post("/orders")
        .send({
          userCpf: "12345678900",
          products: [{ productId: "prod1", quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockOrder);
      expect(createOrderUseCase.execute).toHaveBeenCalledWith("12345678900", [
        { productId: "prod1", quantity: 2 },
      ]);
    });
  });

  describe("GET /order/payment/status - getOrderPaymentStatus", () => {
    it("should return payment status for a given order", async () => {
      const mockPaymentStatus = "PAID";

      (getOrderPaymentStatusUseCase.execute as jest.Mock).mockResolvedValue(
        mockPaymentStatus
      );

      const response = await request(app)
        .get("/order/payment/status")
        .query({ orderId: "order123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ paymentStatus: mockPaymentStatus });
      expect(getOrderPaymentStatusUseCase.execute).toHaveBeenCalledWith(
        "order123"
      );
    });
  });

  describe("GET /orders - getOrders", () => {
    it("should return a list of orders", async () => {
      const mockOrders = [
        {
          _id: "order123",
          status: "OPENED",
          totalAmount: 40,
        },
      ];

      (getOrdersUseCase.execute as jest.Mock).mockResolvedValue(mockOrders);

      const response = await request(app).get("/orders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(getOrdersUseCase.execute).toHaveBeenCalled();
    });
  });

  describe("GET /orders/status - getOrderByStatus", () => {
    it("should return orders filtered by status", async () => {
      const mockOrders = [
        {
          _id: "order123",
          status: "DELIVERED",
          totalAmount: 50,
        },
      ];

      (getOrdersByStatusUseCase.execute as jest.Mock).mockResolvedValue(
        mockOrders
      );

      const response = await request(app)
        .get("/orders/status")
        .query({ status: "DELIVERED" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(getOrdersByStatusUseCase.execute).toHaveBeenCalledWith([
        "DELIVERED",
      ]);
    });
  });

  describe("PUT /order/:id/status - updateOrderStatus", () => {
    it("should update the status of an order and return 200", async () => {
      const mockUpdatedOrder = {
        _id: "order123",
        status: "DELIVERED",
        paymentStatus: "PAID",
      };

      (updateOrderStatusUseCase.execute as jest.Mock).mockResolvedValue(
        mockUpdatedOrder
      );

      const response = await request(app)
        .put("/order/order123/status")
        .send({ paymentStatus: "PAID", status: "DELIVERED" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Order status updated successfully",
        order: mockUpdatedOrder,
      });
      expect(updateOrderStatusUseCase.execute).toHaveBeenCalledWith(
        "order123",
        { paymentStatus: "PAID", status: "DELIVERED" }
      );
    });

    it("should return 404 if the order is not found", async () => {
      (updateOrderStatusUseCase.execute as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/order/order123/status")
        .send({ paymentStatus: "PAID", status: "DELIVERED" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
      expect(updateOrderStatusUseCase.execute).toHaveBeenCalledWith(
        "order123",
        { paymentStatus: "PAID", status: "DELIVERED" }
      );
    });
  });
});

describe("OrderUseCases", () => {
  describe("CreateOrderUseCase", () => {
    let createOrderUseCase: CreateOrderUseCase;

    beforeEach(() => {
      mockOrderRepository.save.mockReset();
      mockOrderRepository.findById.mockReset();
      mockOrderRepository.findByStatus.mockReset();
      mockOrderRepository.findAll.mockReset();
      mockOrderRepository.updateById.mockReset();
      mockUserRepository.create.mockReset();
      mockUserRepository.findByCpf.mockReset();
      mockProductRepository.create.mockReset();
      mockProductRepository.update.mockReset();
      mockProductRepository.save.mockReset();
      mockProductRepository.delete.mockReset();
      mockProductRepository.findById.mockReset();
      mockProductRepository.findByCategory.mockReset();

      createOrderUseCase = new CreateOrderUseCase(
        mockOrderRepository,
        mockUserRepository,
        mockProductRepository
      );
    });

    it("should successfully create an order", async () => {
      const userCpf = "12345678901";
      const products = [
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 1 },
      ];

      const mockUser = { cpf: userCpf, name: "John Doe" };
      const mockProduct1 = { id: "product-1", price: 100 };
      const mockProduct2 = { id: "product-2", price: 50 };

      mockUserRepository.findByCpf.mockResolvedValue(mockUser);
      mockProductRepository.findById
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      mockOrderRepository.save.mockResolvedValue({
        _id: "generated-id",
        user: mockUser,
        status: "OPENED",
        orderProducts: [
          { product: mockProduct1, quantity: 2, price: 100 },
          { product: mockProduct2, quantity: 1, price: 50 },
        ],
        createdAt: new Date(),
        paymentStatus: "PENDING",
        totalAmount: 250,
      });

      const result = await createOrderUseCase.execute(userCpf, products);

      expect(result).toEqual({
        _id: "generated-id",
        user: mockUser,
        status: "OPENED",
        orderProducts: [
          { product: mockProduct1, quantity: 2, price: 100 },
          { product: mockProduct2, quantity: 1, price: 50 },
        ],
        createdAt: expect.any(Date),
        paymentStatus: "PENDING",
        totalAmount: 250,
      });
      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(userCpf);
      expect(mockProductRepository.findById).toHaveBeenCalledWith("product-1");
      expect(mockProductRepository.findById).toHaveBeenCalledWith("product-2");
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it("should throw an error if user is not found", async () => {
      const userCpf = "12345678901";
      const products = [{ productId: "product-1", quantity: 1 }];

      mockUserRepository.findByCpf.mockResolvedValue(null);

      await expect(
        createOrderUseCase.execute(userCpf, products)
      ).rejects.toThrow("User not found");
    });

    it("should throw an error if product is not found", async () => {
      const userCpf = "12345678901";
      const products = [{ productId: "nonexistent-product", quantity: 1 }];

      mockUserRepository.findByCpf.mockResolvedValue({ cpf: userCpf });
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        createOrderUseCase.execute(userCpf, products)
      ).rejects.toThrow("Product with ID nonexistent-product not found");
    });

    it("should throw an error if products is not an array", async () => {
      const userCpf = "12345678901";
      const products = "invalid-products" as any;

      await expect(
        createOrderUseCase.execute(userCpf, products)
      ).rejects.toThrow("Products must be an array");
    });
  });

  describe("GetOrderPaymentStatusUseCase", () => {
    let getOrderPaymentStatusUseCase: GetOrderPaymentStatusUseCase;

    beforeEach(() => {
      // Initialize use case with the mocked repository
      getOrderPaymentStatusUseCase = new GetOrderPaymentStatusUseCase(
        mockOrderRepository
      );
    });

    it("should return payment status when order is found", async () => {
      const orderId = "order-123";
      const mockOrder: OrderDTO = {
        _id: orderId,
        user: {
          _id: "12345",
          cpf: "12345678901",
          name: "John Doe",
          email: "emailtest@gmail.com",
        },
        status: "OPENED",
        orderProducts: [],
        createdAt: new Date(),
        paymentStatus: "PAID", // Mocked payment status
        totalAmount: 100,
      };

      // Mock the order repository to return a valid order
      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await getOrderPaymentStatusUseCase.execute(orderId);

      expect(result).toBe("PAID");
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });

    it("should throw an error if order ID is not provided", async () => {
      await expect(getOrderPaymentStatusUseCase.execute("")).rejects.toThrow(
        "Order ID must be provided"
      );
    });

    it("should throw an error if order is not found", async () => {
      const orderId = "order-123";

      // Mock the order repository to return null (order not found)
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        getOrderPaymentStatusUseCase.execute(orderId)
      ).rejects.toThrow("Order not found");
    });

    it("should throw an error if the order repository fails", async () => {
      const orderId = "order-123";

      // Simulate an error from the repository (e.g., database issue)
      mockOrderRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        getOrderPaymentStatusUseCase.execute(orderId)
      ).rejects.toThrow(
        "Failed to retrieve order payment status: Database error"
      );
    });
  });

  describe("GetOrdersUseCase", () => {
    let getOrdersUseCase: GetOrdersUseCase;

    beforeEach(() => {
      // Initialize the use case with the mocked repository
      getOrdersUseCase = new GetOrdersUseCase(mockOrderRepository);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe("getOrders()", () => {
      it("should return filtered orders excluding finalized ones", async () => {
        const mockOrders: Partial<Order>[] = [
          {
            _id: "1",
            user: {
              _id: "12345",
              cpf: "123",
              name: "User 1",
              email: "emailtest@gmail.com",
            },
            status: ORDER_STATUSES[0], // OPENED
            orderProducts: [],
            createdAt: new Date(),
            paymentStatus: "PAID",
            totalAmount: 100,
          },
          {
            _id: "2",
            user: {
              _id: "12345",
              cpf: "456",
              name: "User 2",
              email: "emailtest@gmail.com",
            },
            status: ORDER_STATUSES[4], // FINALIZED
            orderProducts: [],
            createdAt: new Date(),
            paymentStatus: "PENDING",
            totalAmount: 200,
          },
        ];

        mockOrderRepository.findAll.mockResolvedValue(mockOrders as Order[]);

        const result = await getOrdersUseCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0]._id).toBe("1");
        expect(mockOrderRepository.findAll).toHaveBeenCalledTimes(1);
      });

      it("should throw an error if findAll fails", async () => {
        mockOrderRepository.findAll.mockRejectedValue(
          new Error("Database error")
        );

        await expect(getOrdersUseCase.execute()).rejects.toThrow(
          "Failed to retrieve orders: Database error"
        );
      });
    });

    describe("getOrderById()", () => {
      it("should return the order DTO when order is found", async () => {
        const mockOrder: Partial<Order> = {
          _id: "1",
          user: {
            _id: "12345",
            cpf: "123",
            name: "User 1",
            email: "emailtest@gmail.com",
          },
          status: ORDER_STATUSES[0], // OPENED
          orderProducts: [],
          createdAt: new Date(),
          paymentStatus: "PAID",
          totalAmount: 100,
        };

        mockOrderRepository.findById.mockResolvedValue(mockOrder as Order);

        const result = await getOrdersUseCase.getOrderById("1");

        expect(result?._id).toBe("1");
        expect(result?.status).toBe(ORDER_STATUSES[0]);
        expect(mockOrderRepository.findById).toHaveBeenCalledWith("1");
      });

      it("should throw an error if orderId is not provided", async () => {
        await expect(getOrdersUseCase.getOrderById("")).rejects.toThrow(
          "Order ID must be provided"
        );
      });

      it("should throw an error if order is not found", async () => {
        mockOrderRepository.findById.mockResolvedValue(null);

        await expect(
          getOrdersUseCase.getOrderById("non-existent-id")
        ).rejects.toThrow("Order not found");
      });

      it("should throw an error if findById fails", async () => {
        mockOrderRepository.findById.mockRejectedValue(
          new Error("Database error")
        );

        await expect(getOrdersUseCase.getOrderById("1")).rejects.toThrow(
          "Failed to retrieve order by ID: Database error"
        );
      });
    });
  });

  describe("GetOrdersByStatusUseCase", () => {
    let getOrdersByStatusUseCase: GetOrdersByStatusUseCase;

    beforeEach(() => {
      getOrdersByStatusUseCase = new GetOrdersByStatusUseCase(
        mockOrderRepository
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return orders for the provided status", async () => {
      const mockStatus = ["OPENED"];
      const mockOrders: Partial<Order>[] = [
        {
          _id: "1",
          user: {
            _id: "12345",
            cpf: "12345678901",
            name: "User 1",
            email: "emailtest@gmail.com",
          },
          status: "OPENED",
          orderProducts: [],
          createdAt: new Date(),
          paymentStatus: "PAID",
          totalAmount: 150,
        },
        {
          _id: "2",
          user: {
            _id: "12345",
            cpf: "98765432101",
            name: "User 2",
            email: "emailtest@gmail.com",
          },
          status: "OPENED",
          orderProducts: [],
          createdAt: new Date(),
          paymentStatus: "PENDING",
          totalAmount: 200,
        },
      ];

      mockOrderRepository.findByStatus.mockResolvedValue(mockOrders as Order[]);

      const result = await getOrdersByStatusUseCase.execute(mockStatus);

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe("1");
      expect(result[1]._id).toBe("2");
      expect(mockOrderRepository.findByStatus).toHaveBeenCalledWith(mockStatus);
    });

    it("should throw an error if status is not provided", async () => {
      await expect(getOrdersByStatusUseCase.execute(undefined)).rejects.toThrow(
        "Status must be provided as an array"
      );
    });

    it("should throw an error if status is not an array", async () => {
      await expect(getOrdersByStatusUseCase.execute("OPENED")).rejects.toThrow(
        "Status must be provided as an array"
      );
    });

    it("should return an empty array if no orders match the status", async () => {
      const mockStatus = ["CLOSED"];
      mockOrderRepository.findByStatus.mockResolvedValue([]);

      const result = await getOrdersByStatusUseCase.execute(mockStatus);

      expect(result).toHaveLength(0);
      expect(mockOrderRepository.findByStatus).toHaveBeenCalledWith(mockStatus);
    });

    it("should throw an error if findByStatus fails", async () => {
      const mockStatus = ["OPENED"];
      mockOrderRepository.findByStatus.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        getOrdersByStatusUseCase.execute(mockStatus)
      ).rejects.toThrow("Failed to retrieve orders by status: Database error");
    });
  });

  describe("UpdateOrderStatusUseCase", () => {
    let updateOrderStatusUseCase: UpdateOrderStatusUseCase;

    beforeEach(() => {
      updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
        mockOrderRepository
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should update the order status and return the updated order", async () => {
      const orderId = "order-123";
      const updateData: {
        status:
          | "OPENED"
          | "RECEIVED"
          | "PREPARING"
          | "CLOSED"
          | "FINISHED"
          | "CANCELED"
          | undefined;
      } = { status: "CLOSED" };
      const mockOrder: Order = {
        _id: orderId,
        user: {
          _id: "12345",
          cpf: "12345678901",
          name: "John Doe",
          email: "emailtest@gmail.com",
        },
        status: "CLOSED",
        orderProducts: [],
        createdAt: new Date(),
        paymentStatus: "PAID",
        totalAmount: 100,
      };

      mockOrderRepository.updateById.mockResolvedValue(mockOrder);

      const result = await updateOrderStatusUseCase.execute(
        orderId,
        updateData
      );

      expect(result).toEqual({
        _id: mockOrder._id,
        user: mockOrder.user,
        status: mockOrder.status,
        orderProducts: mockOrder.orderProducts,
        createdAt: mockOrder.createdAt,
        paymentStatus: mockOrder.paymentStatus,
        totalAmount: mockOrder.totalAmount,
      });
      expect(mockOrderRepository.updateById).toHaveBeenCalledWith(
        orderId,
        updateData
      );
    });

    it("should throw an error if orderId is not provided", async () => {
      const updateData: {
        status:
          | "OPENED"
          | "RECEIVED"
          | "PREPARING"
          | "CLOSED"
          | "FINISHED"
          | "CANCELED"
          | undefined;
      } = { status: "CLOSED" };

      await expect(
        updateOrderStatusUseCase.execute("", updateData)
      ).rejects.toThrow("Order ID must be provided");
    });

    it("should throw an error if no update data is provided", async () => {
      const orderId = "order-123";

      await expect(
        updateOrderStatusUseCase.execute(orderId, {})
      ).rejects.toThrow(
        "At least one field (payment or status) must be provided for update"
      );
    });

    it("should throw an error if the order is not found", async () => {
      const orderId = "order-123";
      const updateData: {
        status:
          | "OPENED"
          | "RECEIVED"
          | "PREPARING"
          | "CLOSED"
          | "FINISHED"
          | "CANCELED"
          | undefined;
      } = { status: "CLOSED" };

      mockOrderRepository.updateById.mockResolvedValue(null);

      await expect(
        updateOrderStatusUseCase.execute(orderId, updateData)
      ).rejects.toThrow("Order not found");

      expect(mockOrderRepository.updateById).toHaveBeenCalledWith(
        orderId,
        updateData
      );
    });

    it("should throw an error if repository updateById method fails", async () => {
      const orderId = "order-123";
      const updateData: {
        status:
          | "OPENED"
          | "RECEIVED"
          | "PREPARING"
          | "CLOSED"
          | "FINISHED"
          | "CANCELED"
          | undefined;
      } = { status: "PREPARING" };

      mockOrderRepository.updateById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        updateOrderStatusUseCase.execute(orderId, updateData)
      ).rejects.toThrow("Failed to update order status: Database error");

      expect(mockOrderRepository.updateById).toHaveBeenCalledWith(
        orderId,
        updateData
      );
    });
  });
});
