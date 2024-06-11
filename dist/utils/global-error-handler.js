//import { NextFunction } from "express-serve-static-core";
import HttpStatusCode from "../utils/http-status-code";
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