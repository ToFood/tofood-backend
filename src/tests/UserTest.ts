// File Path: src/tests/UserTest.ts

import { CreateUserUseCase } from "../core/use_cases/CreateUserUseCase";
import { IUserRepository } from "../adapters/repositories/IUserRepository";
import { User } from "../core/entities/User";
import { beforeEach, describe, it, expect } from "@jest/globals"; // Atualizado para Jest

// Mock do repositório do usuário
class MockUserRepository implements IUserRepository {
    private users: User[] = [];

    async create(user: User) {
        this.users.push(user);
        return user;
    }

    async findByCpf(cpf: string) {
        return this.users.find(user => user.cpf === cpf) || null;
    }
}

describe("User Use Cases", () => {
    let userRepository: IUserRepository;
    let createUserUseCase: CreateUserUseCase;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        createUserUseCase = new CreateUserUseCase(userRepository);
    });

    /**
     * Testes para [CreateUserUseCase]
     */
    describe("CreateUserUseCase", () => {
        it("deve criar um usuário com sucesso", async () => {
            const userRequest = {
                name: "Bob Ferrer",
                cpf: "12345678901",
                email: "bob@example.com"
            };

            const result = await createUserUseCase.execute(userRequest);

            expect(result).toHaveProperty("id");
            expect(result.name).toBe(userRequest.name);
            expect(result.cpf).toBe(userRequest.cpf);
            expect(result.email).toBe(userRequest.email);
        });

        it("deve lançar um erro se o nome estiver ausente", async () => {
            const userRequest = {
                cpf: "12345678901",
                email: "bob@example.com"
            };

            await expect(createUserUseCase.execute(userRequest as any))
                .rejects
                .toThrow("Name is required");
        });

        it("deve lançar um erro se o CPF estiver ausente", async () => {
            const userRequest = {
                name: "Bob Ferrer",
                email: "bob@example.com"
            };

            await expect(createUserUseCase.execute(userRequest as any))
                .rejects
                .toThrow("CPF is required");
        });

        it("deve lançar um erro se o email estiver ausente", async () => {
            const userRequest = {
                name: "Bob Ferrer",
                cpf: "12345678901"
            };

            await expect(createUserUseCase.execute(userRequest as any))
                .rejects
                .toThrow("Email is required");
        });
    });

    /**
     * Testes para [GetUserByCpfUseCase]
     */
    describe("GetUserByCPFUseCase", () => {
        it("deve retornar um usuário pelo CPF", async () => {
            const userRequest = {
                name: "Leo Anj",
                cpf: "98765432100",
                email: "leo@example.com"
            };

            // Criando o usuário primeiro
            await createUserUseCase.execute(userRequest);

            // Procurando o usuário
            const foundUser = await userRepository.findByCpf(userRequest.cpf);

            expect(foundUser).not.toBeNull();
            expect(foundUser?.name).toBe(userRequest.name);
            expect(foundUser?.cpf).toBe(userRequest.cpf);
            expect(foundUser?.email).toBe(userRequest.email);
        });

        it("deve retornar null se o CPF não for encontrado", async () => {
            const foundUser = await userRepository.findByCpf("00000000000");

            expect(foundUser).toBeNull();
        });
    });
});
