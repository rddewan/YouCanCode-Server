import { RequestHandler, Router } from "express";
import { signup } from "../data/controllers/auth/auth-controller";

const router = Router();

router.post("/signup", signup as RequestHandler);

export default router;
