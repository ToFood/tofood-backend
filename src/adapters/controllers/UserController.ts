import express, { Request, Response } from "express";
import { createUserUseCase, getUserByCpfUseCase } from "../../config/di/container"; // Importando os use cases diretamente
import { UserDTO } from "../dtos/UserDTO";

const router = express.Router();

/*[APIS USUÁRIOS] */
class UserController {
  

  /*[CRIAR USUÁRIO : FROM BODY]
    Cria um novo usuário com base nos dados enviados no corpo da requisição.
  */
  static createUser = async (req: Request, res: Response) => {
    
    const userDTO: UserDTO = await createUserUseCase.execute(req.body);
    res.status(201).send(userDTO);
  };



  /*[BUSCA USUÁRIO PELO CPF : FROM PARAMS]
    Busca um usuário pelo CPF fornecido nos parâmetros da requisição.
  */
  static getUserByCPF = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    
    const userDTO: UserDTO | null = await getUserByCpfUseCase.execute(cpf);
    res.status(userDTO ? 200 : 404).send(userDTO || { message: "User not found" });
  };
}

/*DEFININDO OS ENDPOINTS*/
router.gety("/users/:cpf", UserController.getUserByCPF);
router.post("/users", UserController.createUser);

export default router;
