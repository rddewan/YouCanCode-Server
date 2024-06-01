import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch-async";
import User, { IUser } from "../../../model/user-model";
import AppError from "../../../utils/app-error";
import HttpStatusCode from "../../../utils/http-status-code";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import AwsS3Helper from "../../../utils/class/aws-s3-helper";

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

/**
 * Returns a Multer instance that provides several methods
 * for generating middleware that process files uploaded in multipart/form-data format.
 */
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	}, // 5 MB
	fileFilter: multerImageFilter,
});

/**
 * Processes an image buffer by resizing it to a width and height of 200 pixels,
 * preserving the aspect ratio, converting it to JPEG format with a quality of 75,
 * and returning the resulting buffer.
 *
 * @param {Buffer} buffer - The image buffer to be processed.
 * @return {Promise<Buffer>} A promise that resolves to the processed image buffer.
 */
const processImage = async (buffer: Buffer): Promise<Buffer> => {
	return await sharp(buffer)
		.resize({ width: 200, height: 200, fit: "contain" })
		.toFormat("jpeg")
		.jpeg({ quality: 75 })
		.toBuffer();
};

export const uploadImage = upload.single("image"); // image is the name of the input field in the form

export const resizeProfileImage = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// if there is no file to resize then return
		if (!req.file) {
			return next();
		}
		// set the file name
		req.file.filename = `user-${req.user.id}}.jpeg`;

		// resize the image and send as the buffer to the next middleware
		const buffer = await processImage(req.file.buffer);
		// Override the original buffer with the processed buffer
		req.file.buffer = buffer;

		next();
	},
);

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

export const updateProfilePhtoto = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// if there is no file then return error
		const file = req.file;
		if (!file) {
			return next(
				new AppError(
					"Please upload an image",
					HttpStatusCode.BAD_REQUEST,
				),
			);
		}

		// get the file name from the file
		const fileName = file.filename;
		// upload the file to s3 bucket
		await AwsS3Helper.getInstance().uploadObject(
			fileName,
			file.buffer,
			file.mimetype,
		);

		// generate the signed url - that will expires in 1 hour
		const photoUrl = await AwsS3Helper.getInstance().getSignedUrl(
			fileName,
			3600,
		);

		// update the user profile photo
		const user: IUser | null = await User.findByIdAndUpdate(
			req.user.id,
			{ photo: fileName },
			{ new: true, runValidators: true },
		);

		res.status(HttpStatusCode.OK).json({
			status: "success",
			data: {
				user,
				photoUrl,
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
