import express from "express";
import userRouter from "./route/user-routes.js";
import authRouter from "./route/auth-routes.js";
import adminRouter from "./route/admin-routes.js";
import homeRouter from "./route/home-routes.js";
import AppError from "./utils/app-error.js";
import globalErrorHandler from "./utils/global-error-handler.js";
import HttpStatusCode from "./utils/http-status-code.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const corsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = [
			"http://localhost:2000",
			"http://localhost:3000",
			"https://mobileacademy.io",
			"https://wecancode.in",
		];
		/// check if the origin is in the allowedOrigins array
		if (!origin || allowedOrigins.includes(origin)) {
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
// middleware to serve static files  from public folder
app.use(express.static("public"));
// set the view engine as ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
// WEB ROUTES
app.use("/", homeRouter);
app.use("/verify-email", authRouter);
app.use("/password", authRouter);
// API ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
/**
 * The app.all() middleware function in your code is a catch-all route handler
 * that gets executed for all incoming requests that do not match any of the defined routes.
 * This middleware function is used to handle 404 errors,
 * i.e., when a route is requested that does not exist on the server.
 */
app.all("*", (req, res, next) => {
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
//# sourceMappingURL=app.js.map
