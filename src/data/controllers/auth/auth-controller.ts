import { Request, Response } from "express";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType, IUser } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";
import Email from "../../../utils/email";
import crypto from "crypto";

export async function signup(
	req: Request<Record<string, unknown>, Record<string, unknown>, IUserDto>,
	res: Response<UserReponse>,
): Promise<void> {
	try {
		const { name, email, password, passwordConfirm } = req.body;

		const newUser = await User.create({
			name,
			email,
			password,
			passwordConfirm,
			authType: AuthType.email,
		});

		const verifyEmailToken = newUser.createVerifyEmailToken();
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
	} catch (error) {
		res.status(400).json({
			status: "fail",
			message: error,
		});
	}
}

// verify email
export const verifyEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
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
	} catch (error) {
		res.status(400).json({
			status: "fail",
			message: error,
		});
	}
};
