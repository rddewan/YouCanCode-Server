import { Router } from "express";
import { restrict } from "../data/controllers/auth/auth-controller";
import { UserRole } from "../model/user-model";

const router = Router();

router.use(restrict(UserRole.admin));

router.get("/users", (req, res) => {
	res.send("Admin route");
});

export default router;
