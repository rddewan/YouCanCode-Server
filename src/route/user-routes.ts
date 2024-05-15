import { RequestHandler, Router } from "express";
import { me } from "../data/controllers/user/user-controller";
import { protect } from "../data/controllers/auth/auth-controller";

const router = Router();

// this will protect all the routes below with this middleware
router.use(protect);

router.get("/me", me as RequestHandler);

export default router;
