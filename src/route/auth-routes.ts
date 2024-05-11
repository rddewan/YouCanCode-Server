import { RequestHandler, Router } from "express";
import { signup, verifyEmail } from "../data/controllers/auth/auth-controller";

const router = Router();

router.post("/signup", signup as RequestHandler);
router.patch("/verify-email/:token", verifyEmail as RequestHandler);

export default router;
