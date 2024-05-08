import { Request, Response } from "express";
import { IUserDto } from "../../dtos/user.dto";
import User, { AuthType } from "../../../model/user-model";
import { UserReponse } from "../../../model/types/user-response";

/**
 * Creates a new user account.
 *
 * @param {Request<Record<string, unknown>, Record<string, unknown>, IUserDto>} req - The request object containing the user data.
 * @param {Response<UserReponse>} res - The response object to send the result.
 * @return {Promise<void>} - A promise that resolves when the user account is created successfully.
 */
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

		await newUser.save({ validateBeforeSave: false });

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
		res.status(500).json({
			status: "fail",
			message: error,
		});
	}
};
