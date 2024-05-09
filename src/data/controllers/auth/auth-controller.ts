import { Request, Response } from "express";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";

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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const verifyEmailToken = newUser.createVerifyEmailToken();

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
