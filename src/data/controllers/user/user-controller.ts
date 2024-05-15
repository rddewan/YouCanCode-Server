import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch-async";
import User, { IUser } from "../../../model/user-model";
import AppError from "../../../utils/app-error";
import HttpStatusCode from "../../../utils/http-status-code";

export const me = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const user: IUser | null = await User.findById(req.user.id);

		if (!user) {
			return next(
				new AppError("User not found", HttpStatusCode.NOT_FOUND),
			);
		}

		res.status(HttpStatusCode.OK).json({
			status: "success",
			data: {
				user,
			},
		});
	},
);

// export const create = async (
// 	req: Request<object, object, IUserDto>,
// 	res: Response,
// ) => {
// 	// if (req.user) {
// 	// 	const userID = req.user.id;
// 	// }

// 	res.status(200).send("Hello from user controller");
// };

// export const getUserById = async (
// 	req: Request<UserRouteParams, object, object, UserQueryParams>,
// 	res: Response<UserReponse>,
// ) => {
// 	const routeParamsId = req.params.id;
// 	const userId = req.query.id;

// 	res.status(200).json({
// 		status: "success",
// 		data: {
// 			id: userId || routeParamsId,
// 		},
// 	});
// };
