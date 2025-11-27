import { body } from "express-validator";

const EmprestimoValidatorData = {
  solicitar: [
    body("valor")
      .isNumeric()
      .withMessage("O valor deve ser numérico")
      .custom((value) => value >= 100 && value <= 10000)
      .withMessage("O valor deve ser entre 100 e 10.000"),
    body("prazo_meses")
      .isInt({ min: 1, max: 60 })
      .withMessage("O prazo deve ser entre 1 e 60 meses"),
    body("password")
      .matches(/^\d{6}$/)
      .withMessage("A senha deve conter 6 dígitos numéricos"),
  ],
  pagar: [
    body("password")
      .matches(/^\d{6}$/)
      .withMessage("A senha deve conter 6 dígitos numéricos"),
  ],
};

export default EmprestimoValidatorData;