import { body } from "express-validator";

const TransacaoValidatorData = {
  transferMoney: [
    body("password")
      .matches(/^\d{6}$/)
      .withMessage("Senha inválida"),
    body("value")
      .isNumeric()
      .withMessage("O valor tem que ser do tipo numérico"),
    body("chave_transferencia")
      .isString()
      .withMessage("Chave de transferência inválida"),
  ],
};

export default TransacaoValidatorData
