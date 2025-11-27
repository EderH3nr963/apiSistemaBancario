import express from "express";
import UsuarioController from "../controllers/UsuarioController";
import { body } from "express-validator";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import UsuarioValidatorData from "../middlewares/UsuarioValidatorData";

const router = express.Router();

// Rotas fixas primeiro
router.get("/", UsuarioController.get);
router.get("/verify-session", UsuarioController.verifySession);
router.delete("/logout", UsuarioController.logout);

router.patch(
  "/email",
  [body("email").isEmail().withMessage("Email inválido")],
  MyValidatorResult,
  UsuarioController.updateEmail
);
router.patch(
  "/password-login",
  UsuarioValidatorData.updatePassword,
  MyValidatorResult,
  UsuarioController.updatePasswordUsuario
);
router.patch(
  "/password-conta",
  UsuarioValidatorData.updatePassword,
  MyValidatorResult,
  UsuarioController.updatePasswordConta
);
router.patch(
  "/telefone",
  UsuarioValidatorData.updateTelefone,
  MyValidatorResult,
  UsuarioController.updateTelefone
);
router.patch(
  "/endereco",
  UsuarioValidatorData.updateEndereco,
  MyValidatorResult,
  UsuarioController.updateEndereco
);
router.patch(
  "/chave-pix",
  [body("chave_transferencia").isLength({ min: 1 }).withMessage("Chave Pix é obrigatória")],
  MyValidatorResult,
  UsuarioController.updateChaveTransferencia
);
router.post(
  "/cofrinho/add",
  [body("valor").isFloat({ min: 0.01 }).withMessage("Valor deve ser maior que 0")],
  MyValidatorResult,
  UsuarioController.addToCofrinho
);
router.post(
  "/cofrinho/withdraw",
  [body("valor").isFloat({ min: 0.01 }).withMessage("Valor deve ser maior que 0")],
  MyValidatorResult,
  UsuarioController.withdrawFromCofrinho
);

// Rotas dinâmicas por último
router.get("/chave-pix/:chave_transferencia", UsuarioController.getByChaveTransferencia);
router.get("/cpf/:cpf", UsuarioController.getByCpf);
router.get("/phone/:phone", UsuarioController.getByPhone);

export default router;
