import { Request, Response } from "express";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";
import Email from "../../../utils/email";

export const signup = async (
	req: Request<Record<string, unknown>, Record<string, unknown>, IUserDto>,
	res: Response<UserReponse>,
): Promise<void> => {
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
		// create a url
		const url = `${req.protocol}://${req.get("hotst")}/api/v1/auth/verifyEmail/${verifyEmailToken}`;
		// send the veriify email
		await new Email(newUser, url, "24 hours").sendVerifyEmail();

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
};
