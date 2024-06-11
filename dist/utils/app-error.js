class AppError extends Error {
	statusCode;
	status;
	isOperational;
	/**
	 * Creates a new instance of the AppError class.
	 *
	 * @param {string} message - The error message.
	 * @param {number} statusCode - The HTTP status code associated with the error.
	 */
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}
export default AppError;
//# sourceMappingURL=app-error.js.map
