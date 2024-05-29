import express, { NextFunction, Request, Response } from "express";
import userRouter from "./route/user-routes";
import authRouter from "./route/auth-routes";
import adminRouter from "./route/admin-routes";
import AppError from "./utils/app-error";
import globalErrorHandler from "./utils/global-error-handler";
import HttpStatusCode from "./utils/http-status-code";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";

const app = express();

const corsOptions: CorsOptions = {
	origin: function (
		origin: string | undefined,
		callback: (error: Error | null, isValid: boolean) => void,
	) {
		const allowedOrigins = [
			"http://localhost:3000",
			"https://mobileacademy.io",
			"https://wecancode.in",
		];
		if (origin && allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"), false);
		}
	},
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	credentials: true,
};
// middleware to enable the cors
app.use(cors(corsOptions));
// middleware to parse the cookies
app.use(cookieParser());
// middleware to parse the json
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

/**
 * The app.all() middleware function in your code is a catch-all route handler
 * that gets executed for all incoming requests that do not match any of the defined routes.
 * This middleware function is used to handle 404 errors,
 * i.e., when a route is requested that does not exist on the server.
 */
app.all("*", (req: Request, res: Response, next: NextFunction) => {
	next(
		new AppError(
			`Can't find ${req.originalUrl} on this server!`,
			HttpStatusCode.NOT_FOUND,
		),
	);
});

/**
 * The app.use(globalErrorHandler); is responsible for using the globalErrorHandler middleware function
 * for all incoming requests. This middleware function is used to handle errors
 * that occur during the request-response cycle.
 */
app.use(globalErrorHandler);

export default app;
