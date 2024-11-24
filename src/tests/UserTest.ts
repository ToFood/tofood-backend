import express, { Express } from "express";
import request from "supertest";
import router from "../adapters/controllers/UserController";
import { UserDTO } from "../adapters/dtos/UserDTO";
import { createUserUseCase, getUserByCpfUseCase } from "../config/di/container";

// Mock use cases
jest.mock("../config/di/container", () => ({
  createUserUseCase: {
    execute: jest.fn(),
  },
  getUserByCpfUseCase: {
    execute: jest.fn(),
  },
}));

describe("UserController", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users", () => {
    it("should create a new user and return the user DTO", async () => {
      // Mock data
      const userDTO: Partial<UserDTO> = {
        cpf: "12345678901",
        name: "John Doe",
        email: "john.doe@example.com",
      };
      (createUserUseCase.execute as jest.Mock).mockResolvedValue(userDTO);

      // Send request
      const response = await request(app)
        .post("/users")
        .send({ cpf: userDTO.cpf, name: userDTO.name, email: userDTO.email });

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(userDTO);
      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        cpf: userDTO.cpf,
        name: userDTO.name,
        email: userDTO.email,
      });
    });

    it("should return 500 if an error occurs", async () => {
      (createUserUseCase.execute as jest.Mock).mockRejectedValue(
        new Error("Internal Server Error")
      );

      const response = await request(app).post("/users").send({
        cpf: "12345678901",
        name: "John Doe",
        email: "john.doe@example.com",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });

  describe("GET /users/:cpf", () => {
    it("should return the user DTO if the user exists", async () => {
      // Mock data
      const userDTO: Partial<UserDTO> = {
        cpf: "12345678901",
        name: "John Doe",
        email: "john.doe@example.com",
      };
      (getUserByCpfUseCase.execute as jest.Mock).mockResolvedValue(userDTO);

      // Send request
      const response = await request(app).get(`/users/${userDTO.cpf}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(userDTO);
      expect(getUserByCpfUseCase.execute).toHaveBeenCalledWith(userDTO.cpf);
    });

    it("should return 404 if the user does not exist", async () => {
      (getUserByCpfUseCase.execute as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/users/12345678901");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
      expect(getUserByCpfUseCase.execute).toHaveBeenCalledWith("12345678901");
    });

    it("should return 500 if an error occurs", async () => {
      (getUserByCpfUseCase.execute as jest.Mock).mockRejectedValue(
        new Error("Internal Server Error")
      );

      const response = await request(app).get("/users/12345678901");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });
});
