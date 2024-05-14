import { RequestHandler, Router } from "express";
import {
	login,
	signup,
	verifyEmail,
} from "../data/controllers/auth/auth-controller";

const router = Router();

router.post("/signup", signup as RequestHandler);
router.post("/login", login as RequestHandler);
router.patch("/verify-email/:token", verifyEmail as RequestHandler);

export default router;
