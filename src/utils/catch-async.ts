import { NextFunction, Request, Response } from "express";

type AsyncFunction = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void>;

const catchAsync =
	(fn: AsyncFunction) =>
	(req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch((err) => next(err));
	};

export default catchAsync;
