import express from "express";
import TransacaoValidatorData from "../middlewares/TransacaoValidatorData";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import TransacaoController from "../controllers/TransacaoController";
import { param } from "express-validator";

const router = express.Router();

router.post(
  "/",
  TransacaoValidatorData.transferMoney,
  MyValidatorResult,
  TransacaoController.transferMoney
);

router.get(
  "/",
  TransacaoController.getAll
);

router.get(
  "/:id_transacao",
  [param("id_transacao").isNumeric().withMessage("Id de transação inválido")],
  MyValidatorResult,
  TransacaoController.get
);

export default router;