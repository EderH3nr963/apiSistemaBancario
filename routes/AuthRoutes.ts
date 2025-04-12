import express from "express";
import AuthController from "../controllers/AuthController";
import AuthValidatorData from "../middlewares/AuthValidatorData";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import { body } from "express-validator";
const router = express.Router();

router.post(
  "/register",
  AuthValidatorData.register,
  MyValidatorResult,
  AuthController.register
);
router.post(
  "/login",
  AuthValidatorData.login,
  MyValidatorResult,
  AuthController.login
);

router.get(
  "/email-in-use",
  [body("email").isEmail().withMessage("Email inválido")],
  MyValidatorResult,
  AuthController.emailInUse
);
router.get(
  "/cpf-in-use",
  body("cpf")
    .matches(/^\d{11}$/)
    .withMessage("CPF inválido"),
  MyValidatorResult,
  AuthController.cpfInUse
);

router.get(
  "/send-code-verification",
  [body("email").isEmail().withMessage("Email inválido")],
  MyValidatorResult,
  AuthController.sendCodeVerification
);
router.post(
  "/verify-code",
  AuthValidatorData.verifyCode,
  MyValidatorResult,
  AuthController.verifyCode
);

router.patch(
  "/reset-password",
  AuthValidatorData.resetPassword,
  MyValidatorResult,
  AuthController.resetPassword
);

export default router;
