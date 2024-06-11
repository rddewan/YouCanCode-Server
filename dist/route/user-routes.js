import { Router } from "express";
import {
	deleteMe,
	disableMe,
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
router.get("/me", me);
router.patch(
	"/update-profile-photo",
	uploadImage,
	resizeProfileImage,
	updateProfilePhtoto,
);
router.patch("/update-me", updateMe);
router.delete("/delete-me", deleteMe);
router.patch("/disable-me", disableMe);
export default router;
//# sourceMappingURL=user-routes.js.map
