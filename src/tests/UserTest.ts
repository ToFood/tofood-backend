import express, { Express } from "express";
import request from "supertest";
import router from "../adapters/controllers/UserController";
import { UserDTO } from "../adapters/dtos/UserDTO";
import { IUserRepository } from "../adapters/repositories/IUserRepository";
import { createUserUseCase, getUserByCpfUseCase } from "../config/di/container";
import { User } from "../core/entities/User";
import { CreateUserUseCase } from "../core/use_cases/CreateUserUseCase";
import { GetUserByCpfUseCase } from "../core/use_cases/GetUserByCpfUseCase";

// Mock use cases
jest.mock("../config/di/container", () => ({
  createUserUseCase: {
    execute: jest.fn(),
  },
  getUserByCpfUseCase: {
    execute: jest.fn(),
  },
}));

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByCpf: jest.fn(),
  create: jest.fn(),
};

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

describe("UserUseCases", () => {
  describe("CreateUserUseCase", () => {
    let createUserUseCase: CreateUserUseCase;

    beforeEach(() => {
      createUserUseCase = new CreateUserUseCase(mockUserRepository);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully create a user and return a UserDTO", async () => {
      const request = {
        name: "John Doe",
        cpf: "12345678901",
        email: "john.doe@example.com",
      };

      const mockUser: User = new User(
        "generated-id",
        request.name,
        request.cpf,
        request.email
      );

      // Mock repository create method
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await createUserUseCase.execute(request);

      expect(result).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        cpf: mockUser.cpf,
        email: mockUser.email,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUser);
    });

    it("should throw an error if the name is missing", async () => {
      const request = {
        name: "",
        cpf: "12345678901",
        email: "john.doe@example.com",
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        "Name is required"
      );
    });

    it("should throw an error if the CPF is missing", async () => {
      const request = {
        name: "John Doe",
        cpf: "",
        email: "john.doe@example.com",
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        "CPF is required"
      );
    });

    it("should throw an error if the email is missing", async () => {
      const request = {
        name: "John Doe",
        cpf: "12345678901",
        email: "",
      };

      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        "Email is required"
      );
    });

    it("should throw an error if the repository throws an error", async () => {
      const request = {
        name: "John Doe",
        cpf: "12345678901",
        email: "john.doe@example.com",
      };

      mockUserRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        "Failure to create user: Database error"
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        new User("generated-id", request.name, request.cpf, request.email)
      );
    });
  });

  describe("GetUserByCpfUseCase", () => {
    let getUserByCpfUseCase: GetUserByCpfUseCase;

    beforeEach(() => {
      getUserByCpfUseCase = new GetUserByCpfUseCase(mockUserRepository);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return a UserDTO when a user is found", async () => {
      const cpf = "12345678901";
      const mockUser: User = new User(
        "generated-id",
        "John Doe",
        cpf,
        "john.doe@example.com"
      );

      // Mock repository to return the user
      mockUserRepository.findByCpf.mockResolvedValue(mockUser);

      const result = await getUserByCpfUseCase.execute(cpf);

      expect(result).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        cpf: mockUser.cpf,
        email: mockUser.email,
      });
      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(cpf);
    });

    it("should return null when the user is not found", async () => {
      const cpf = "12345678901";

      // Mock repository to return null
      mockUserRepository.findByCpf.mockResolvedValue(null);

      const result = await getUserByCpfUseCase.execute(cpf);

      expect(result).toBeNull();
      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(cpf);
    });

    it("should throw an error if the CPF is an empty string", async () => {
      const cpf = "";

      await expect(getUserByCpfUseCase.execute(cpf)).rejects.toThrow(
        "CPF must be a non-empty string"
      );
    });

    it("should throw an error if the CPF is not a string", async () => {
      const cpf: any = 12345678901; // Non-string CPF

      await expect(getUserByCpfUseCase.execute(cpf)).rejects.toThrow(
        "CPF must be a non-empty string"
      );
    });

    it("should propagate errors from the repository", async () => {
      const cpf = "12345678901";

      // Mock repository to throw an error
      mockUserRepository.findByCpf.mockRejectedValue(
        new Error("Database error")
      );

      await expect(getUserByCpfUseCase.execute(cpf)).rejects.toThrow(
        "Failure to fetch user by CPF: Database error"
      );

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(cpf);
    });
  });
});
