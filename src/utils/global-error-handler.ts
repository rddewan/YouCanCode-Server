import { Request, Response } from "express";
import ErrorConstructor from "../utils/app-error";
import AppError from "../utils/app-error";

const handleDuplicateFieldsDB = (err: ErrorConstructor) => {
	const match = err.message.match(/(["'])(\\?.)*?\1/);
	const value = match ? match[0] : undefined;
	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new AppError(message, 400);
};

//const handleFirebaseTokenExpiredError = () => new AppError('Firebase ID token has expired. Get a fresh ID token from your client app and try again.', 401);

const handleJWTExpiredError = () =>
	new AppError("Your token has expired! Please log in again.", 401);

const handleJWTError = () =>
	new AppError("Invalid token. Please log in again!", 401);

const sentErrorDev = (err: ErrorConstructor, req: Request, res: Response) => {
	// A) API
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	}
	// B) RENDERED WEBSITE
	// eslint-disable-next-line no-console
	console.error("ERROR 💥", err);
	return res.status(err.statusCode).render("error", {
		title: "Something went wrong!",
		msg: err.message,
	});
};

const sendErrorProd = (err: ErrorConstructor, req: Request, res: Response) => {
	// A) API
	if (req.originalUrl.startsWith("/api")) {
		// A) Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		// B) Programming or other unknown error: don't leak error details
		// 1) Log error
		// eslint-disable-next-line no-console
		console.error("ERROR 💥", err);
		// 2) Send generic message
		return res.status(500).json({
			status: "error",
			message: "Something went very wrong!",
		});
	}

	// B) RENDERED WEBSITE
	// A) Operational, trusted error: send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).render("error", {
			title: "Something went wrong!",
			msg: err.message,
		});
	}
	// B) Programming or other unknown error: don't leak error details
	// 1) Log error
	// eslint-disable-next-line no-console
	console.error("ERROR 💥", err);
	// 2) Send generic message
	return res.status(err.statusCode).render("error", {
		title: "Something went wrong!",
		msg: "Please try again later.",
	});
};

export const globalErrorHandler = (
	err: ErrorConstructor,
	req: Request,
	res: Response,
) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sentErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };

		error.message = err.message;
		if (error.statusCode === 11000) error = handleDuplicateFieldsDB(error);

		if (error.name === "JsonWebTokenError") error = handleJWTError();
		if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
		sendErrorProd(error, req, res);
	} else {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
};
