import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../domain/errors";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    });
    return;
  }

  if (error instanceof SyntaxError && "status" in error) {
    response.status(400).json({
      code: "bad_request",
      message: "Request body must contain valid JSON.",
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    code: "internal_server_error",
    message: "Internal server error.",
  });
}
