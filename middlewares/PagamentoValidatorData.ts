import { body } from "express-validator";

const PagamentoValidatorData = {
  pay: [
    body("password")
      .matches(/^\d{6}$/)
      .withMessage("Senha inválida"),
    body("chave_pagamento")
      .isString()
      .withMessage("Chave de pagamento inválida"),
  ],
  
};

export default PagamentoValidatorData;