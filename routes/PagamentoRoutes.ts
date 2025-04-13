import { body, param } from "express-validator";
import PagamentoController from "../controllers/PagamentoController";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import PagamentoValidatorData from "../middlewares/PagamentoValidatorData";
import express from "express";

const router = express.Router();

router.post(
  "/",
  [
    body("valor")
      .isNumeric()
      .withMessage("O Valor tem que ser do tipo numérico"),
  ],
  MyValidatorResult,
  PagamentoController.set
);

router.get(
  "/:chave_pagamento",
  [
    param("chave_pagamento")
      .isString()
      .withMessage("Chave de pagamento inválida"),
  ],
  MyValidatorResult,
  PagamentoController.get
);

router.post(
  "/pay",
  PagamentoValidatorData.pay,
  MyValidatorResult,
  PagamentoController.pay
);

router.delete(
  "/:chave_pagamento",
  [
    param("chave_pagamento")
      .isString()
      .withMessage("Chave de pagamento inválida"),
  ],
  MyValidatorResult,
  PagamentoController.cancel
);

export default router;