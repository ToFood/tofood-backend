import { User } from '../../core/entities/User';

/**
 * Interface para o repositório de usuários.
 * Define os métodos que qualquer repositório de usuários deve implementar.
 */
export interface IUserRepository {
    create(user: User): Promise<User>;
    findByCpf(cpf: string): Promise<User | null>;
}
