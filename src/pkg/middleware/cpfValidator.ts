import { cpf as CPFValidator } from "cpf-cnpj-validator";
import { NextFunction, Request, Response } from "express";

const validateCPF = (req: Request, res: Response, next: NextFunction) => {
  let cpf = "";

  // Extraindo o CPF do corpo ou da query da requisição
  if (req.body && req.body.cpf) {
    cpf = req.body.cpf;
  } else if (req.params && req.params.cpf) {
    cpf = req.params.cpf as string;
  }

  // Verificando se o CPF foi fornecido
  if (!cpf) {
    return res.status(400).json({ error: "CPF is required" });
  }

  // Usando regex para verificar se o CPF possui exatamente 11 dígitos
  const cpfRegex = /^\d{11}$/;
  if (!cpfRegex.test(cpf)) {
    return res.status(400).json({ error: "CPF must be 11 digits" });
  }

  // Validando o CPF com a biblioteca cpf-cnpj-validator
  if (!CPFValidator.isValid(cpf)) {
    return res.status(400).json({ error: "Invalid CPF" });
  }

  // Prosseguindo para o próximo middleware ou rota
  next();
};

export default validateCPF;
