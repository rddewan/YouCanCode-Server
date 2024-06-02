import { RequestHandler, Router } from "express";
import {
	me,
	resizeProfileImage,
	updateMe,
	updateProfilePhtoto,
	uploadImage,
} from "../data/controllers/user/user-controller";
import { protect } from "../data/controllers/auth/auth-controller";

const router = Router();

// this will protect all the routes below with this middleware
router.use(protect);

router.get("/me", me as RequestHandler);
router.patch(
	"/update-profile-photo",
	uploadImage,
	resizeProfileImage as RequestHandler,
	updateProfilePhtoto as RequestHandler,
);
router.patch("/update-me", updateMe as RequestHandler);

export default router;
