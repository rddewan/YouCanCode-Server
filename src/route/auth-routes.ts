import { RequestHandler, Router } from "express";
import {
	createNewToken,
	forgotPasword,
	login,
	resetPassword,
	signup,
	verifyEmail,
} from "../data/controllers/auth/auth-controller";

const router = Router();

router.post("/signup", signup as RequestHandler);
router.post("/login", login as RequestHandler);
router.patch("/verify-email/:token", verifyEmail as RequestHandler);
router.post("/refresh-token", createNewToken as RequestHandler);
router.post("/forgot-password", forgotPasword as RequestHandler);
router.patch("/reset-password/:token", resetPassword as RequestHandler);

export default router;
