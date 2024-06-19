//import { NextFunction } from "express-serve-static-core";
import HttpStatusCode from "../utils/http-status-code.js";
import mongoose from "mongoose";
const isMongoDBError = (err) => {
	return err instanceof mongoose.mongo.MongoError;
};
const sendErrorDev = (err, req, res) => {
	err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
	err.status = err.status || "error";
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		erroe: err,
		stackTrack: err.stack,
	});
};
const sendErrorProd = (err, req, res) => {
	if (isMongoDBError(err)) {
		const error = { ...err };
		if (error.code === 11000) {
			const keyValue = error.keyValue;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			const [key, value] = Object.entries(keyValue)[0];
			return res.status(HttpStatusCode.CONFLICT).json({
				status: "fail",
				message: `Duplicate field key ${key} and value: ${value}. Please use another value!`,
			});
		}
	}
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
/**
 * Global error handler for handling different error scenarios based on the environment.
 *
 * @param {AppError} err - The error object to be handled
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function in the middleware chain
 */
const globalErrorHandler = (
	err,
	req,
	res,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next,
) => {
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
//# sourceMappingURL=global-error-handler.js.map
