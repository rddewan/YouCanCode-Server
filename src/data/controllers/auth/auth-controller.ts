import { Request, Response } from "express";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";
import Email from "../../../utils/email";

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
