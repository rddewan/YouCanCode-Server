//import { NextFunction } from "express-serve-static-core";
import HttpStatusCode from "../utils/http-status-code";
import AppError from "./app-error";
import { Request, Response } from "express";

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
	err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
	err.status = err.status || "error";

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		erroe: err,
		stackTrack: err.stack,
	});
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
	if (err.isOperational) {
		err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
		err.status = err.status || "error";
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		res.status(err.statusCode).json({
			status: "error",
			message: "Something went very wrong!",
		});
	}
};

const globalErrorHandler = (err: AppError, req: Request, res: Response) => {
	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		sendErrorProd(err, req, res);
	} else {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
};

export default globalErrorHandler;
