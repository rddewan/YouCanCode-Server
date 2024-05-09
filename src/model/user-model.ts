import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export enum AuthType {
	email = "email",
	social = "social",
	phone = "phone",
}

export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	photo: string;
	photoUrl: string;
	role: string;
	password: string;
	passwordConfirm?: string;
	passwordChangedAt?: Date;
	passwordResetToken?: string;
	passwordResetExpires?: Date;
	verifyEmailToken?: string;
	verifyEmailExpires?: Date;
	authType?: AuthType;
	phoneNumber?: string;
	active: boolean;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			maxlength: [50, "Name can not be more than 50 characters"],
			minlength: [4, "Name can not be less than 3 characters"],
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
			lowercase: true,
		},
		phoneNumber: {
			type: String,
			unique: true,
			required: false,
			sparse: true,
		},
		photo: {
			type: String,
			default: "default.jpg",
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: [8, "Password must be at least 8 characters"],
			maxlength: [20, "Password can not be more than 20 characters"],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, "Please add a confirm password"],
			validate: {
				validator(this: IUser, passwordConfirm: string) {
					return passwordConfirm === this.password;
				},
				message: "Passwords do not match",
			},
		},
		emailVerified: {
			type: Boolean,
			default: false,
		},
		authType: {
			type: String,
			enum: AuthType,
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		verifyEmailToken: String,
		verifyEmailExpires: Date,
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

// pre hook middleware - run before save and create
// function to encrypt the password
userSchema.pre("save", async function (next) {
	// only run this function if the password was actually modified
	if (!this.isModified("password")) return next();
	if (!this.password) return next();
	// hash the password witht eh salt of 12
	this.password = await bcrypt.hash(this.password, 12);
	// delete the passwordConfirm field
	this.passwordConfirm = undefined;
	// next middleware
	next();
});

const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;
