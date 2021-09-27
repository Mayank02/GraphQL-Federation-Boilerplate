import { Request, Response, NextFunction } from "express";

export const logger = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("request", req.method, req.path, req.headers, req.query);
  next();
};
