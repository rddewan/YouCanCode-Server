import { Router } from "express";
const router = Router();
router.get("/", (req, res) => {
	res.render("page/index");
});
export default router;
//# sourceMappingURL=home-routes.js.map
