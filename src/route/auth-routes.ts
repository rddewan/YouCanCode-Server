import express, { RequestHandler } from "express";
import { signup } from "../data/controllers/auth/auth-controller";

// el
const router = express.Router();

router.post("/signup", signup as RequestHandler);

router.post("/verifyToken/:token", signup as RequestHandler);

export default router;
