import { Router } from "express";
import {
	createNewToken,
	firebasePhoneLogin,
	firebaseSolicalLogin,
	forgotPasword,
	login,
	passwordResetFailure,
	passwordResetSuccess,
	protect,
	resetPassword,
	resetPasswordView,
	resetPasswordWeb,
	signup,
	updatePassword,
	verifyEmail,
} from "../data/controllers/auth/auth-controller.js";
const router = Router();
// WEB - server side rendering
router.post("/reset", resetPasswordWeb);
router.get("/reset/:token", resetPasswordView);
router.get("/reset/status/success", passwordResetSuccess);
router.get("/reset/status/failure", passwordResetFailure);
// API
router.post("/signup", signup);
router.post("/login", login);
router.get("/:token", verifyEmail);
router.post("/refresh-token", createNewToken);
router.post("/forgot-password", forgotPasword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-my-password", protect, updatePassword);
router.post("/firebase-solical-login", firebaseSolicalLogin);
router.post("/firebase-phone-login", firebasePhoneLogin);
export default router;
//# sourceMappingURL=auth-routes.js.map
