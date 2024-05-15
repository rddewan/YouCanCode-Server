import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType, IUser } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";
import Email from "../../../utils/email";
import crypto from "crypto";
import catchAsync from "../../../utils/catch-async";
import AppError from "../../../utils/app-error";
import HttpStatusCode from "../../../utils/http-status-code";
import { ILoginDto } from "../../dtos/login.dto";
import RefreshToken, {
	IRefreshToken,
} from "../../../model/refresh-token-model";
import { promisify } from "util";
import { CreateNewTokenRequestBody } from "../../../model/types/create-new-token-rquest-body";
import { RequestCookies } from "../../../model/types/request-cookies";

type verifyFunction = (
	token: string,
	secret: jwt.Secret,
) => Promise<JwtPayload>;

/**
 * Generates an access token for the provided user ID.
 *
 * @param {string} id - The user ID for which the access token is generated.
 * @return {string} The generated access token.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateAccessToken = (id: string): string => {
	const accessToken = jwt.sign(
		{ id },
		process.env.JWT_ACCESS_TOKEN_SECRET || "",
		{
			expiresIn: process.env.JWT_AUTH_TOKEN_EXPIRES_IN || 300,
		},
	);

	return accessToken;
};

/**
 * Generates a refresh token for the provided user ID.
 *
 * @param {string} id - The user ID for which the refresh token is generated.
 * @return {string} The generated refresh token.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateRefreshToken = (id: string): string => {
	const refreshToken = jwt.sign(
		{ id },
		process.env.JWT_REFRESH_TOKEN_SECRET || "",
		{
			expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
		},
	);

	return refreshToken;
};

const createAndSendToken = async (
	user: IUser,
	res: Response,
): Promise<void> => {
	const accessToken = generateAccessToken(user._id as string);
	const refreshToken = generateRefreshToken(user._id as string);

	await RefreshToken.findOneAndDelete({
		userId: { $eq: user._id as string },
	});

	const hashRefreshToken = crypto
		.createHash("sha256")
		.update(refreshToken)
		.digest("hex");

	await RefreshToken.create({
		refreshToken: hashRefreshToken,
		userId: user._id as string,
	});

	res.status(HttpStatusCode.OK).json({
		status: "success",
		data: {
			accessToken,
			refreshToken,
		},
	});
};

/**
 * Verifies the refresh token using the provided secret and returns the decoded payload.
 *
 * @param {string} refreshToken - The refresh token to be verified.
 * @param {jwt.Secret} secret - The secret key for verification.
 * @param {NextFunction} next - The next function to call in case of errors.
 * @return {Promise<JwtPayload | undefined>} The decoded payload if verification is successful, otherwise undefined.
 */
export const verifyRefreshToken = async (
	refreshToken: string,
	secret: jwt.Secret,
	next: NextFunction,
): Promise<JwtPayload | undefined> => {
	try {
		const verify: verifyFunction = promisify(jwt.verify);

		const decode = await verify(refreshToken, secret);

		return decode;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			next(
				new AppError(
					"Your refresh token token expired, please login again",
					HttpStatusCode.INVALID_TOKEN,
				),
			);
		} else {
			next(
				new AppError(
					"Your refresh token is invalid, please login again",
					HttpStatusCode.INVALID_TOKEN,
				),
			);
		}
	}
};

export const verifyAccessToken = async (
	accessToken: string,
	secret: jwt.Secret,
	next: NextFunction,
): Promise<JwtPayload | undefined> => {
	try {
		const verify: verifyFunction = promisify(jwt.verify);

		const decode = await verify(accessToken, secret);

		return decode;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			next(
				new AppError(
					"Your access token token expired, please login again",
					HttpStatusCode.UNAUTHORIZED,
				),
			);
		} else {
			next(
				new AppError(
					"Your access token is invalid, please login again",
					HttpStatusCode.BAD_REQUEST,
				),
			);
		}
	}
};

export const createNewToken = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const body = req.body as CreateNewTokenRequestBody;
		const cookies = req.cookies as RequestCookies;

		const refreshToken = body.refreshToken || cookies.refreshToken;

		// check if the refresh token exists in the request
		if (!refreshToken) {
			return next(
				new AppError(
					"Your refresh token is missing, please login again",
					HttpStatusCode.INVALID_TOKEN,
				),
			);
		}

		// verify the refresh token
		const JWT_REFRESH_TOKEN_SECRET =
			process.env.JWT_REFRESH_TOKEN_SECRET || "";
		const decoded = await verifyRefreshToken(
			refreshToken,
			JWT_REFRESH_TOKEN_SECRET,
			next,
		);
		// check if the user still exists in the DB
		const user: IUser | null = await User.findById(decoded?.id as string);

		const refreshTokenHash = crypto
			.createHash("sha256")
			.update(refreshToken)
			.digest("hex");

		const token: IRefreshToken | null = await RefreshToken.findOne({
			userId: { $eq: user?._id as string },
			refreshToken: { $eq: refreshTokenHash },
		});

		if (!token || !user) {
			return next(
				new AppError(
					"User or Token does not exist, please login again",
					HttpStatusCode.NOT_FOUND,
				),
			);
		}

		await createAndSendToken(user, res);
	},
);

export const signup = catchAsync(
	async (
		req: Request<
			Record<string, unknown>,
			Record<string, unknown>,
			IUserDto
		>,
		res: Response<UserReponse>,
	): Promise<void> => {
		const { name, email, password, passwordConfirm } = req.body;

		const newUser = await User.create({
			name,
			email,
			password,
			passwordConfirm,
			authType: AuthType.email,
		});

		const verifyEmailToken = newUser.createVerifyEmailToken();
		// save the user - we have updated the user model - verifyEmailToken/verifyEmailExpires
		await newUser.save({ validateBeforeSave: false });
		// protocol is http or https
		const protocol = req.protocol;
		// host is localhost:3000 - mobileacademy.io
		const host = req.get("host");
		// create a verify email url
		const verifyEmailUrl = `${protocol}://${host}/api/v1/auth/verify-email/${verifyEmailToken}`;
		// send the verify email
		await new Email(newUser, verifyEmailUrl, " 24 hours").sendVerifyEmail();

		res.status(201).json({
			status: "success",
			data: {
				user: {
					id: newUser._id as string,
					name: newUser.name,
					email: newUser.email,
					role: newUser.role,
					authType: newUser.authType,
				},
			},
		});
	},
);

// verify email
export const verifyEmail = catchAsync(
	async (req: Request, res: Response): Promise<void> => {
		const token = crypto
			.createHash("sha256")
			.update(req.params.token)
			.digest("hex");

		const user: IUser | null = await User.findOne({
			verifyEmailToken: token,
			verifyEmailExpires: { $gt: Date.now() },
		});

		if (!user) {
			throw new Error("Token is invalid or has expired");
		}

		// protocol is http or https
		const protocol = req.protocol;
		// host is localhost:3000 - mobileacademy.io
		const host = req.get("host");
		// create a verify email url
		const welcomeEmailUrl = `${protocol}://${host}/me`;
		// send the verify email
		await new Email(user, welcomeEmailUrl).sendWelcomeEmail();

		// update the user - emailVerified = true
		user.emailVerified = true;
		// save the user - disable the validateBeforeSave option
		await user.save({ validateBeforeSave: false });

		res.status(200).json({
			status: "success",
			data: {
				user: {
					id: user._id as string,
					name: user.name,
					email: user.email,
					role: user.role,
					authType: user.authType,
				},
			},
		});
	},
);

export const login = catchAsync(
	async (
		req: Request<
			Record<string, unknown>,
			Record<string, unknown>,
			ILoginDto
		>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		// destructure the request body
		const { email, password } = req.body;

		// check if email and password exist
		if (!email || !password) {
			return next(
				new AppError(
					"Please provide email and password!",
					HttpStatusCode.BAD_REQUEST,
				),
			);
		}
		// check if user exists and password is correct
		const user: IUser | null = await User.findOne({ email }).select(
			"+password",
		);

		if (!user || !(await user.checkPassword(user.password, password))) {
			return next(
				new AppError(
					"Incorrect email or password",
					HttpStatusCode.UNAUTHORIZED,
				),
			);
		}

		if (!user.emailVerified) {
			// 403 (Forbidden): If the user's email is not verified and they aren't allowed to perform the requested action without a verified email
			return next(
				new AppError(
					"Please verify your email",
					HttpStatusCode.FORBIDDEN,
				),
			);
		}

		await createAndSendToken(user, res);
	},
);
