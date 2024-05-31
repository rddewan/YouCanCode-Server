import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch-async";
import User, { IUser } from "../../../model/user-model";
import AppError from "../../../utils/app-error";
import HttpStatusCode from "../../../utils/http-status-code";
import multer, { FileFilterCallback } from "multer";

/**
 * Filters the uploaded file to ensure it is an image.
 *
 * @param {Request} req - The request object.
 * @param {Express.Multer.File} file - The uploaded file.
 * @param {FileFilterCallback} cb - The callback function to be called with the result of the filter.
 * @return {void} - No return value.
 */
const multerImageFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback,
) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb(
			new AppError(
				"Not an image! Please upload only images.",
				HttpStatusCode.BAD_REQUEST,
			),
		);
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	}, // 5 MB
	fileFilter: multerImageFilter,
});

export const uploadImage = upload.single("image"); // image is the name of the input field in the form

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
