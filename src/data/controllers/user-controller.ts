import { Request, Response } from "express";
import { IUserDto } from "../dtos/user.dto";
import { UserQueryParams } from "../../model/types/user-query-params";
import { UserRouteParams } from "../../model/types/user-route-params";
import { UserReponse } from "../../model/types/user-response";

export const me = async (req: Request, res: Response) => {
	// if (req.user) {
	// 	const userID = req.user.id;
	// }
	res.status(200).send("Hello from user controller");
};

export const create = async (
	req: Request<object, object, IUserDto>,
	res: Response,
) => {
	// if (req.user) {
	// 	const userID = req.user.id;
	// }

	res.status(200).send("Hello from user controller");
};

export const getUserById = async (
	req: Request<UserRouteParams, object, object, UserQueryParams>,
	res: Response<UserReponse>,
) => {
	const routeParamsId = req.params.id;
	const userId = req.query.id;

	res.status(200).json({
		status: "success",
		data: {
			id: userId || routeParamsId,
		},
	});
};
