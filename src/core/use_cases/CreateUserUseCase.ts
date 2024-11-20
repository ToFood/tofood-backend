import { IUserRepository } from '../../adapters/repositories/IUserRepository';
import { User } from '../entities/User';
import { UserDTO } from '../../adapters/dtos/UserDTO';

/**
 * Dados de entrada para criar um novo usuário.
 */
interface CreateUserRequest {
    name: string;
    cpf: string;
    email: string;
}

/**
 * Caso de uso para criar ucpf, email } = request;

        // Validações de campos obrigatórios
        if (!name) {
            throw new Error("Name is required");
        }
        if (!cpf) {
            throw new Error("CPF is required");
        }
        if (!email) {
            throw new Error("Email is required");
        }

        try {
            // Criar uma nova instância do usuário (entidade de domínio)
            const user = new User('generated-id', name, cpf, email);

            // Salvar o usuário no repositório
            const savedUser = await this.userRepository.create(user);

            // Retornar um DTO em vez da entidade de domínio
            return {
                id: savedUser._id,
                name: savedUser.name,
                cpf: savedUser.cpf,
                email: savedUser.email,
            };
        } catch (error: any) {
            throw new Error(`Failure to create user: ${error.message}`);
        }
    }
}
