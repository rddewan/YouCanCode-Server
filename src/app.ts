import express, { NextFunction, Request, Response } from "express";
import userRouter from "./route/user-routes";
import authRouter from "./route/auth-routes";
import AppError from "./utils/app-error";
import globalErrorHandler from "./utils/global-error-handler";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

/**
 * The app.all() middleware function in your code is a catch-all route handler
 * that gets executed for all incoming requests that do not match any of the defined routes.
 * This middleware function is used to handle 404 errors,
 * i.e., when a route is requested that does not exist on the server.
 */
app.all("*", (req: Request, res: Response, next: NextFunction) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/**
 * The app.use(globalErrorHandler); is responsible for using the globalErrorHandler middleware function
 * for all incoming requests. This middleware function is used to handle errors
 * that occur during the request-response cycle.
 */
app.use(globalErrorHandler);

export default app;
