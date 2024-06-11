import nodemailerSendgrid from "nodemailer-sendgrid";
import modemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default class Email {
	constructor(user, url, expiresIn) {
		(this.to = user.email), (this.firstName = user.name.split("")[0]);
		this.url = url;
		this.from =
			process.env.EMAIL_FROM ||
			"Richard Dewan <richard@mobileacademt.io>";
		this.expiresIn = expiresIn;
	}
	createNewTransport() {
		if (process.env.NODE_ENV === "production") {
			return modemailer.createTransport(
				nodemailerSendgrid({
					apiKey: process.env.SENDGRID_API_KEY || "",
				}),
			);
		}
		return modemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			authMethod: "LOGIN",
			secure: false,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}
	async send(template, subject) {
		const emailPath = path.join(
			__dirname,
			"../view/email/",
			`${template}.ejs`,
		);
		const html = await ejs.renderFile(
			emailPath,
			{
				firstName: this.firstName,
				url: this.url,
				expiresIn: this.expiresIn,
			},
			{
				async: true,
			},
		);
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html: html,
		};
		await this.createNewTransport().sendMail(mailOptions);
	}
	async sendVerifyEmail() {
		await this.send("verifyEmail", "YouCanCode: Verify your email address");
	}
	async sendWelcomeEmail() {
		await this.send("welcome", "YouCanCode: Welcome to YouCanCode");
	}
	async sendPasswordResetEmail() {
		await this.send(
			"passwordResetEmail",
			"YouCanCode: Reset your password",
		);
	}
}
//# sourceMappingURL=email.js.map
