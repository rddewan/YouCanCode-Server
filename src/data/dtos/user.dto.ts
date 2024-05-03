export interface IUserDto {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
	role?: string;
	authType?: string;
}
