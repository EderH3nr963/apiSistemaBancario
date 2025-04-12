import { NextFunction, Request, Response } from "express";
import { query, validationResult } from "express-validator";

const myValidationResult = validationResult.withDefaults({
  formatter: (error) => error.msg,
});

export default function MyValidatorResult(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = myValidationResult(req).array();

  if (errors.length >= 1) {
    res.status(400).json({
      status: "error",
      statusCode: 400,
      msg: errors[0],
    });
    return;
  }

  next();
}
