import { body } from "express-validator";

const TransacaoValidatorData = {
  transferMoney: [
    body("password")
      .matches(/^\d{6}$/)
      .withMessage("Senha inválida"),
    body("value")
      .isNumeric()
      .withMessage("O valor tem que ser do tipo numérico"),
    body("cpf_destinatario")
      .exists()
      .withMessage("Campo CPF não pode ser nulo.")
      .matches(/^\d{11}$/)
      .withMessage("CPF inválido"),
  ],
};

export default TransacaoValidatorData
