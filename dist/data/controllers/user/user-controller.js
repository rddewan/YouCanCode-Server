import catchAsync from "../../../utils/catch-async";
import User from "../../../model/user-model";
import AppError from "../../../utils/app-error";
import HttpStatusCode from "../../../utils/http-status-code";
import multer from "multer";
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
const multerImageFilter = (req, file, cb) => {
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
const processImage = async (buffer) => {
	return await sharp(buffer)
		.resize({ width: 200, height: 200, fit: "contain" })
		.toFormat("jpeg")
		.jpeg({ quality: 75 })
		.toBuffer();
};
export const uploadImage = upload.single("image"); // image is the name of the input field in the form
export const resizeProfileImage = catchAsync(async (req, res, next) => {
	// if there is no file to resize then return
	if (!req.file) {
		return next();
	}
	// set the file name
	req.file.filename = `user-${req.user.id}.jpeg`;
	// resize the image and send as the buffer to the next middleware
	const buffer = await processImage(req.file.buffer);
	// Override the original buffer with the processed buffer
	req.file.buffer = buffer;
	next();
});
export const me = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if (!user) {
		return next(new AppError("User not found", HttpStatusCode.NOT_FOUND));
	}
	res.status(HttpStatusCode.OK).json({
		status: "success",
		data: {
			user,
		},
	});
});
export const updateProfilePhtoto = catchAsync(async (req, res, next) => {
	// if there is no file then return error
	const file = req.file;
	if (!file) {
		return next(
			new AppError("Please upload an image", HttpStatusCode.BAD_REQUEST),
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
	const user = await User.findByIdAndUpdate(
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
});
export const updateMe = catchAsync(async (req, res, next) => {
	// if there is no name in the body then return error
	if (!req.body.name) {
		return next(
			new AppError("Name is required", HttpStatusCode.BAD_REQUEST),
		);
	}
	// find the user by id and update name
	const user = await User.findByIdAndUpdate(req.user.id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(HttpStatusCode.OK).json({
		status: "success",
		data: {
			user,
		},
	});
});
export const deleteMe = catchAsync(async (req, res, next) => {
	// find the user by id and delete
	const user = await User.findByIdAndDelete(req.user.id);
	// if no user is found then return error
	if (!user) {
		return next(new AppError("User not found", HttpStatusCode.NOT_FOUND));
	}
	// delete the user photo from s3 bucket
	if (user.photo) {
		await AwsS3Helper.getInstance().deleteObject(user.photo);
	}
	// delete the user from the database
	res.status(HttpStatusCode.NO_CONTENT).json({
		status: "success",
		data: null,
	});
});
export const disableMe = catchAsync(async (req, res, next) => {
	// find the user by id and update - set the active status to false
	const user = await User.findByIdAndUpdate(req.user.id, {
		active: false,
	});
	// if no user is found then return error
	if (!user) {
		return next(new AppError("User not found", HttpStatusCode.NOT_FOUND));
	}
	res.status(HttpStatusCode.NO_CONTENT).json({
		status: "success",
		data: null,
	});
});
//# sourceMappingURL=user-controller.js.map